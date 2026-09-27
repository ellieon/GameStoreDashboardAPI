import { randomBytes } from 'crypto';
export function generateApiKey(size = 32, format = 'base64') {
  const buffer = randomBytes(size);
  return buffer.toString(format);
}
