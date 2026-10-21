import fs from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Files that hold PHI (nightly exports, member imports). In AWS they live in the encrypted data bucket
// (DATA_BUCKET); locally they stay on disk so the app runs without an AWS account.

let s3: S3Client | null = null;
const client = () => (s3 ??= new S3Client({}));

export const dataBucket = () => process.env.DATA_BUCKET || null;

/** Writes one nightly export file. Returns where it went, for the log. */
export async function writeExport(day: string, name: string, body: string, localDir = path.join(process.cwd(), 'exports')) {
  const bucket = dataBucket();
  if (bucket) {
    const key = `exports/${day}/${name}`;
    await client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'text/csv', ServerSideEncryption: 'aws:kms' }));
    return `s3://${bucket}/${key}`;
  }
  const dir = path.join(localDir, day);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, name);
  fs.writeFileSync(file, body, { mode: 0o600 });
  return file;
}

export const parseS3Url = (url: string) => {
  const m = /^s3:\/\/([^/]+)\/(.+)$/.exec(url);
  return m ? { bucket: m[1], key: m[2] } : null;
};

/** Reads an input file from a local path or an s3://bucket/key URL. */
export async function readInput(location: string): Promise<Buffer> {
  const s3url = parseS3Url(location);
  if (!s3url) return fs.readFileSync(location);
  const r = await client().send(new GetObjectCommand({ Bucket: s3url.bucket, Key: s3url.key }));
  return Buffer.from(await r.Body!.transformToByteArray());
}
