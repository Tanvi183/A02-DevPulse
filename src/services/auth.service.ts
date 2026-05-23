import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { PublicUser, SignupBody, UserRole } from '../types/index';

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
