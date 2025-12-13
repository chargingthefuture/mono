import crypto from 'crypto';

/**
 * Generate a Time-based One-Time Password (TOTP) similar to Google Authenticator
 * Uses HMAC-SHA1 with 30-second time windows
 */
export function generateTOTP(secret: string, timeStep: number = 30): string {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeUInt32BE(Math.floor(time / 0x100000000), 0);
  timeBuffer.writeUInt32BE(time & 0xffffffff, 4);

  // Secret should be provided as a string (will be converted to buffer)
  // For base32-encoded secrets, decode them first using a base32 library if needed
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'utf8'));
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary = ((hash[offset] & 0x7f) << 24) |
                 ((hash[offset + 1] & 0xff) << 16) |
                 ((hash[offset + 2] & 0xff) << 8) |
                 (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Generate a user-specific secret for OTP generation
 * This should be stored securely per user
 */
export function generateUserSecret(userId: string): string {
  // In production, this should be stored in the database per user
  // For now, we'll generate a deterministic secret based on userId + a server secret
  const serverSecret = process.env.OTP_SERVER_SECRET || 'chyme-otp-secret-change-in-production';
  const combined = `${userId}:${serverSecret}`;
  return crypto.createHash('sha256').update(combined).digest('base64').substring(0, 32);
}

/**
 * Validate an OTP code
 * Allows for time window drift (current, previous, and next window)
 */
export function validateTOTP(otp: string, secret: string, timeStep: number = 30, window: number = 1): boolean {
  const currentTime = Math.floor(Date.now() / 1000 / timeStep);
  
  // Check current, previous, and next time windows
  for (let i = -window; i <= window; i++) {
    const time = currentTime + i;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(Math.floor(time / 0x100000000), 0);
    timeBuffer.writeUInt32BE(time & 0xffffffff, 4);

    // Secret should be provided as a string (will be converted to buffer)
    // For base32-encoded secrets, decode them first using a base32 library if needed
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'utf8'));
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const binary = ((hash[offset] & 0x7f) << 24) |
                   ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) |
                   (hash[offset + 3] & 0xff);

    const generatedOTP = (binary % 1000000).toString().padStart(6, '0');
    
    if (generatedOTP === otp) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate a simple 6-digit OTP that expires in 5 minutes
 * This is simpler than TOTP and easier for users to use
 */
export function generateSimpleOTP(): { code: string; expiresAt: Date } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  return { code, expiresAt };
}
