import type { User } from '@/user/entity/user'
import jwt from 'jsonwebtoken'

const { JWT_SECRET, JWT_EXPIRED } = process.env

export function signToken(payload: Partial<User>) {
  return jwt.sign({ id: payload.id }, JWT_SECRET!, { expiresIn: JWT_EXPIRED })
}
