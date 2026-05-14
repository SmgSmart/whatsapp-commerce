import crypto from 'node:crypto';
import { requireEnv } from './env';

export function createUploadSignature(folder: string) {
  const cloudName = requireEnv('cloudinaryCloudName');
  const apiKey = requireEnv('cloudinaryApiKey');
  const apiSecret = requireEnv('cloudinaryApiSecret');
  const timestamp = Math.floor(Date.now() / 1000);
  const safeFolder = folder === 'products' ? 'products' : 'branding';
  const paramsToSign = `folder=${safeFolder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  return {
    cloudName,
    apiKey,
    timestamp,
    folder: safeFolder,
    signature,
  };
}
