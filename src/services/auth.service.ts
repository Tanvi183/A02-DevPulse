import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { User, PublicUser, SignupBody, UserRole } from '../types/index';

const SALT_ROUNDS = 10;


export async function createUser(body: SignupBody): Promise<PublicUser> {
  const hashed = await bcrypt.hash(body.password, SALT_ROUNDS);
  const role: UserRole = body.role ?? 'contributor';

  const result = await pool.query<PublicUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [body.name.trim(), body.email.toLowerCase().trim(), hashed, role],
  );
  return result.rows[0];
}


export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<PublicUser | null> {
  const result = await pool.query<PublicUser>(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  return result.rows[0] ?? null;
}


export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
