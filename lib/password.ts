import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export function isPasswordHashed(password: string): boolean {
  return password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (isPasswordHashed(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}
