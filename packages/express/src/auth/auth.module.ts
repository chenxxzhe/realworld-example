import type { Request, RequestHandler, Router } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt'
import crypto from 'bcrypt'

import * as userService from '@/user/user.service'
import type { User as DetailUser } from '@/user/entity/user'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends DetailUser {
      id: number
    }
  }
}
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

const jwtWhitelist = new Map<Method, Set<string>>()
export function setAuthFree(method: Method, path: string) {
  let set = jwtWhitelist.get(method)
  if (!set) {
    set = new Set()
    jwtWhitelist.set(method, set)
  }
  set.add(path)
}

export const initAuthModule = (app: Router) => {
  // local
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'user[email]',
        passwordField: 'user[password]',
        session: false,
      },
      async (email, password, cb) => {
        try {
          const user = await userService.findBy('email', email, 0, true)
          if (!user) throw new Error('login fail')
          const pass = await crypto.compare(password, user.password!)
          if (!pass) throw new Error('login fail')
          delete user.password
          cb(null, user)
        } catch (err) {
          cb({ error: err }, false, {
            message: 'Incorrect username or password.',
          })
        }
      },
    ),
  )
  // jwt
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('token'),
        secretOrKey: process.env.JWT_SECRET,
        jsonWebTokenOptions: {
          maxAge: process.env.JWT_EXPIRED,
        },
        passReqToCallback: true,
      },
      (req: Request, payload: { id: number }, done: VerifiedCallback) => {
        const { id } = payload
        return userService
          .findBy('id', id)
          .then((user) => {
            if (user) {
              user.token = req.headers.authorization?.split(' ')[1]
              done(null, user as any)
            } else done(null, false)
          })
          .catch((err) => {
            done(err, false)
          })
      },
    ),
  )

  // 全局路由使用 jwt, 白名单额外配置 setAuthFree
  const authMiddleware: RequestHandler = (req, res, next) => {
    if (jwtWhitelist.get(req.method as any)?.has(req.path)) return next()
    passport.authenticate('jwt', { session: false })(req, res, next)
  }

  app.use(authMiddleware)
}
