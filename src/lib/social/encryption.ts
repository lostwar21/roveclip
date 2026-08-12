import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const getSecretKey = () => {
  const key = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    // Development fallback if not provided, though production should require it
    console.warn("SOCIAL_TOKEN_ENCRYPTION_KEY is not defined. Using an insecure fallback key for development ONLY.");
    return crypto.createHash('sha256').update('insecure_fallback_key').digest();
  }
  if (key.length !== 64) {
    // If it's not a 64-char hex string, hash it to ensure 32 bytes
    return crypto.createHash('sha256').update(key).digest();
  }
  return Buffer.from(key, 'hex');
};

export function encryptToken(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }
  const [ivHex, authTagHex, encryptedData] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
