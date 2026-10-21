import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';

export interface HraStackProps extends cdk.StackProps {
  domain: string;
  planName: string;
  nurseLine: string;
}

// The layout from docs/DEPLOY.md: one image run as two Fargate services (web behind an HTTPS load balancer, and
// exactly one worker), private encrypted RDS Postgres, and every secret in Secrets Manager.
export class HraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HraStackProps) {
    super(scope, id, props);
    const { domain } = props;

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'app', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
        { name: 'db', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });
    const appSubnets = { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS };

    // No punctuation in the generated password, so it can go into DATABASE_URL without escaping.
    const db = new rds.DatabaseInstance(this, 'Db', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.SMALL),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromGeneratedSecret('hra', { excludeCharacters: " %+~`#$&*()|[]{}:;<>?!'/@\"\\,.=^-_" }),
      databaseName: 'hra',
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageEncrypted: true,
      publiclyAccessible: false,
      backupRetention: cdk.Duration.days(14),
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });

    const generated = (name: string, length = 48) =>
      new sm.Secret(this, name, { generateSecretString: { passwordLength: length, excludePunctuation: true } });
    const tokenPepper = generated('TokenPepper');
    const dobPepper = generated('DobPepper'); // never rotate once members are imported: identity hashes depend on it
    const sessionSecret = generated('SessionSecret');
    const adminPassword = generated('AdminPassword', 24);

    // Filled in after the first deploy by infra/set-twilio.sh. Until then sends fail loudly ("Twilio is not configured").
    const twilioKeys = ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY', 'TWILIO_API_SECRET', 'TWILIO_AUTH_TOKEN', 'TWILIO_MESSAGING_SERVICE_SID'];
    const twilioSecret = new sm.Secret(this, 'Twilio', {
      secretName: 'hra/twilio',
      secretObjectValue: Object.fromEntries(twilioKeys.map(k => [k, cdk.SecretValue.unsafePlainText('')])),
    });

    const environment = {
      NODE_ENV: 'production',
      PUBLIC_LINK_BASE: `https://${domain}`,
      PLAN_NAME: props.planName,
      PLAN_NURSE_LINE: props.nurseLine,
      ADMIN_USER: 'admin',
      DB_HOST: db.dbInstanceEndpointAddress,
      DB_PORT: db.dbInstanceEndpointPort,
      DB_NAME: 'hra',
    };
    const secrets: Record<string, ecs.Secret> = {
      DB_USER: ecs.Secret.fromSecretsManager(db.secret!, 'username'),
      DB_PASSWORD: ecs.Secret.fromSecretsManager(db.secret!, 'password'),
      TOKEN_PEPPER: ecs.Secret.fromSecretsManager(tokenPepper),
      DOB_PEPPER: ecs.Secret.fromSecretsManager(dobPepper),
      SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret),
      ADMIN_PASSWORD: ecs.Secret.fromSecretsManager(adminPassword),
      ...Object.fromEntries(twilioKeys.map(k => [k, ecs.Secret.fromSecretsManager(twilioSecret, k)])),
    };

    // Built on the deploying machine. ARM64 builds natively on Apple Silicon and costs less on Fargate.
    const image = ecs.ContainerImage.fromAsset(path.join(__dirname, '../..'), {
      platform: Platform.LINUX_ARM64,
      exclude: ['infra', 'node_modules', '.next', '.git', '.env', 'exports'],
    });
    const runtimePlatform = { cpuArchitecture: ecs.CpuArchitecture.ARM64, operatingSystemFamily: ecs.OperatingSystemFamily.LINUX };
    const logging = (streamPrefix: string) => ecs.LogDrivers.awsLogs({ streamPrefix, logRetention: logs.RetentionDays.ONE_YEAR });

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc, containerInsightsV2: ecs.ContainerInsights.ENABLED });

    // ACM waits here until the validation CNAME exists at your DNS provider (the deploy pauses; see infra/README.md).
    const certificate = new acm.Certificate(this, 'Cert', { domainName: domain, validation: acm.CertificateValidation.fromDns() });

    const web = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Web', {
      cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 2,
      runtimePlatform,
      taskSubnets: appSubnets,
      publicLoadBalancer: true,
      certificate,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
      redirectHTTP: true,
      circuitBreaker: { rollback: true },
      minHealthyPercent: 100,
      taskImageOptions: { image, containerName: 'web', containerPort: 3000, environment, secrets, logDriver: logging('web') },
    });
    web.targetGroup.configureHealthCheck({ path: '/api/health', healthyHttpCodes: '200' });

    // Exactly one worker. It applies migrations and loads forms on start, so a deploy updates the database too.
    const workerTask = new ecs.FargateTaskDefinition(this, 'WorkerTask', { cpu: 512, memoryLimitMiB: 1024, runtimePlatform });
    workerTask.addContainer('worker', {
      image,
      environment,
      secrets,
      command: ['sh', '-c', 'npx prisma migrate deploy && npm run seed:prod && npm run worker:prod'],
      logging: logging('worker'),
    });
    const worker = new ecs.FargateService(this, 'Worker', {
      cluster,
      taskDefinition: workerTask,
      desiredCount: 1,
      minHealthyPercent: 0,
      maxHealthyPercent: 100,
      vpcSubnets: appSubnets,
      enableExecuteCommand: true, // used by infra/import.sh to run imports inside the VPC
      circuitBreaker: { rollback: true },
    });

    db.connections.allowDefaultPortFrom(web.service, 'web tasks');
    db.connections.allowDefaultPortFrom(worker, 'worker task');

    new cdk.CfnOutput(this, 'AppUrl', { value: `https://${domain}` });
    new cdk.CfnOutput(this, 'DnsTarget', {
      value: web.loadBalancer.loadBalancerDnsName,
      description: `Point ${domain} here (CNAME)`,
    });
    new cdk.CfnOutput(this, 'ClusterName', { value: cluster.clusterName });
    new cdk.CfnOutput(this, 'WebService', { value: web.service.serviceName });
    new cdk.CfnOutput(this, 'WorkerService', { value: worker.serviceName });
    new cdk.CfnOutput(this, 'AdminPasswordSecret', { value: adminPassword.secretName });
  }
}
