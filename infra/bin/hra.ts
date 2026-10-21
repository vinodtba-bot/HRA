import * as cdk from 'aws-cdk-lib';
import { HraStack } from '../lib/hra-stack';

const app = new cdk.App();
const domain = app.node.tryGetContext('domain');
if (!domain) throw new Error('Pass the app domain, e.g. npx cdk deploy -c domain=hraapp.ayuhealth.io');

new HraStack(app, 'Hra', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? 'us-east-2' },
  domain,
  planName: app.node.tryGetContext('planName') ?? 'Your health plan',
  nurseLine: app.node.tryGetContext('nurseLine') ?? '',
  alertEmail: app.node.tryGetContext('alertEmail') ?? '',
  loginDomainPrefix: app.node.tryGetContext('loginDomainPrefix') ?? 'ayuhealth-hra-admin',
});
