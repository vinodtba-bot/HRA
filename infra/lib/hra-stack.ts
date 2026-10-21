import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as elbActions from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
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
  /** Care team address that gets crisis alerts. Empty: alerts are only logged. */
  alertEmail: string;
  /** Prefix for the admin sign-in page, <prefix>.auth.<region>.amazoncognito.com. Must be unique in the region. */
  loginDomainPrefix: string;
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

    // Only letters, digits and - _ . in the generated password, so it can go into DATABASE_URL without escaping.
    // (Secrets Manager refuses to exclude every punctuation character.)
    const db = new rds.DatabaseInstance(this, 'Db', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.SMALL),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromGeneratedSecret('hra', { excludeCharacters: " %+~`#$&*()|[]{}:;<>?!'/@\"\\,=^" }),
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

    // Filled in after the first deploy by infra/set-twilio.sh. Until then sends fail loudly ("Twilio is not configured").
    const twilioKeys = ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY', 'TWILIO_API_SECRET', 'TWILIO_AUTH_TOKEN', 'TWILIO_MESSAGING_SERVICE_SID'];
    const twilioSecret = new sm.Secret(this, 'Twilio', {
      secretObjectValue: Object.fromEntries(twilioKeys.map(k => [k, cdk.SecretValue.unsafePlainText('')])),
    });

    // PHI files: nightly exports and uploaded member lists. Encrypted with its own KMS key, never public.
    const dataKey = new kms.Key(this, 'DataKey', { enableKeyRotation: true, removalPolicy: cdk.RemovalPolicy.RETAIN });
    const dataBucket = new s3.Bucket(this, 'Data', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: dataKey,
      bucketKeyEnabled: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        { prefix: 'imports/', expiration: cdk.Duration.days(7), noncurrentVersionExpiration: cdk.Duration.days(1) },
        { prefix: 'exports/', noncurrentVersionExpiration: cdk.Duration.days(30) },
      ],
    });

    // Crisis alerts by email. The message carries no member details, only a pointer to the admin page.
    const crisisTopic = new sns.Topic(this, 'CrisisAlerts', {
      displayName: 'HRA crisis alerts',
      masterKey: kms.Alias.fromAliasName(this, 'SnsKey', 'alias/aws/sns'),
    });
    if (props.alertEmail) crisisTopic.addSubscription(new subs.EmailSubscription(props.alertEmail));

    const environment: Record<string, string> = {
      NODE_ENV: 'production',
      PUBLIC_LINK_BASE: `https://${domain}`,
      PLAN_NAME: props.planName,
      PLAN_NURSE_LINE: props.nurseLine,
      DB_HOST: db.dbInstanceEndpointAddress,
      DB_PORT: db.dbInstanceEndpointPort,
      DB_NAME: 'hra',
      DATA_BUCKET: dataBucket.bucketName,
      CRISIS_ALERT_TOPIC_ARN: crisisTopic.topicArn,
      ADMIN_AUTH: 'alb',
    };
    const secrets: Record<string, ecs.Secret> = {
      DB_USER: ecs.Secret.fromSecretsManager(db.secret!, 'username'),
      DB_PASSWORD: ecs.Secret.fromSecretsManager(db.secret!, 'password'),
      TOKEN_PEPPER: ecs.Secret.fromSecretsManager(tokenPepper),
      DOB_PEPPER: ecs.Secret.fromSecretsManager(dobPepper),
      SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret),
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

    // Admin sign-in: the load balancer sends /admin through Cognito (no self sign-up, MFA required), and the
    // app checks the load balancer's signed identity header. Users are added with the command in infra/README.md.
    const adminPool = new cognito.UserPool(this, 'AdminUsers', {
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: { otp: true, sms: false },
      passwordPolicy: { minLength: 14, requireSymbols: false },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const loginDomain = adminPool.addDomain('Login', { cognitoDomain: { domainPrefix: props.loginDomainPrefix } });
    const adminClient = adminPool.addClient('Alb', {
      generateSecret: true,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
        callbackUrls: [`https://${domain}/oauth2/idpresponse`],
      },
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
    });
    web.listener.addAction('AdminLogin', {
      priority: 10,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/admin', '/admin/*'])],
      action: new elbActions.AuthenticateCognitoAction({
        userPool: adminPool,
        userPoolClient: adminClient,
        userPoolDomain: loginDomain,
        sessionTimeout: cdk.Duration.hours(8),
        next: elbv2.ListenerAction.forward([web.targetGroup]),
      }),
    });
    web.taskDefinition.defaultContainer!.addEnvironment('ADMIN_ALB_ARN', web.loadBalancer.loadBalancerArn);

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

    dataBucket.grantReadWrite(workerTask.taskRole);
    crisisTopic.grantPublish(workerTask.taskRole);

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
    new cdk.CfnOutput(this, 'DataBucket', { value: dataBucket.bucketName });
    new cdk.CfnOutput(this, 'TwilioSecret', { value: twilioSecret.secretName });
    new cdk.CfnOutput(this, 'AdminUserPool', { value: adminPool.userPoolId });
  }
}
