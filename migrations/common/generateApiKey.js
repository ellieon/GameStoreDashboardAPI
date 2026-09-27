import { randomBytes } from 'crypto';
import jsSHA from 'jssha';
export function generateApiKey(size = 32, format = 'base64') {
  const buffer = randomBytes(size);
  return buffer.toString(format);
}

export function hashKeyWithSalt(key, salt) {
  const sha = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  sha.update(`${salt}.${key}`)
  return sha.getHash('B64');
}