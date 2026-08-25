import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // 32 bytes for AES-256
const ALGORITHM = 'aes-256-gcm';

export class EncryptionService {
  /**
   * Encrypts a string using AES-256-GCM.
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedText
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts a string previously encrypted with encrypt().
   */
  static decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hashes a string (e.g. API keys) using SHA-256.
   */
  static hashString(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Generates a new cryptographically secure API key.
   */
  static generateApiKey(prefix = 'agri'): { raw: string; hash: string; prefix: string } {
    const randomPart = crypto.randomBytes(24).toString('base64url');
    const raw = `${prefix}_${randomPart}`;
    const hash = this.hashString(raw);
    return { raw, hash, prefix };
  }
}

export default EncryptionService;
