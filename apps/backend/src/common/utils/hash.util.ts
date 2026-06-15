import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const saltRounds = 12;
const pepper = process.env.DB_PEPPER || 'xuantruong2004';

export class HashUtil {
  /**
   * Hashes a password using HMAC-SHA256 with pepper, then bcryptjs (12 rounds)
   */
  static async hash(password: string): Promise<string> {
    const first = crypto
      .createHmac('sha256', pepper)
      .update(password)
      .digest('base64');

    return bcrypt.hash(first, saltRounds);
  }

  /**
   * Validates a password by comparing it with a stored hash
   */
  static async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const first = crypto
      .createHmac('sha256', pepper)
      .update(password)
      .digest('base64');

    return bcrypt.compare(first, hashedPassword);
  }
}
