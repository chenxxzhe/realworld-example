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
type Trie = Map<string, { end: boolean; children: Trie }>

const jwtWhitelist = new Map<Method, Trie>()
const ANY = '__ANY__'
// 按 path 路径构建前缀树
export function setAuthFree(method: Method, path: string) {
  let trie = jwtWhitelist.get(method)!
  if (!trie) {
    trie = new Map()
    jwtWhitelist.set(method, trie)
  }
  let node = { end: false, children: trie }
  const arr = path.split('/').slice(1)
  for (let dir of arr) {
    if (dir.match(/^:.+$/)) {
      dir = ANY
    }
    if (node.children.has(dir)) {
      node = node.children.get(dir)!
    } else {
      const next = { end: false, children: new Map() }
      node.children.set(dir, next)
      node = next
    }
  }
  node.end = true
}

function checkIsAuthFree(method: Method, path: string) {
  // 与 /article/:slug 冲突了
  if (path === '/articles/feed') return false

  const trie = jwtWhitelist.get(method)!
  if (!trie) return false

  let node = { end: false, children: trie }
  const pass = path
    .split('/')
    .slice(1)
    .every((dir) => {
      if (node?.children.has(dir)) {
        node = node.children.get(dir)!
      } else if (node?.children.has(ANY)) {
        node = node.children.get(ANY)!
      } else {
        return false
      }
      return true
    })
  return pass && node.end
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
    if (
      !req.get('Authorization') &&
      checkIsAuthFree(req.method as any, req.path)
    )
      return next()
    passport.authenticate('jwt', { session: false })(req, res, next)
  }

  app.use(authMiddleware)
}
