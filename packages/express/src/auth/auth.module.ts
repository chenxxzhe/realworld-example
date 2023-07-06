import type { Router, Express } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import crypto from 'bcryptjs'

import * as userService from '@/user/user.service'

const jwtWhitelist = []
export function setAuthFree(path: string) {
  jwtWhitelist.push(path)
}

export const initAuthModule = (app: Router) => {
  passport.use(
    new LocalStrategy(async (email, password, cb) => {
      const res = await userService.findBy('email', email)
      const user = res[0] as any
      if (!user) cb(null, false, { message: 'Incorrect username or password.' })
      const pass = await crypto.compare(password, user.password)
      if (!pass) cb(null, false, { message: 'Incorrect username or password.' })

      cb(null, user)
    }),
  )
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('token'),
        secretOrKey: process.env.JWT_SECRET,
        jsonWebTokenOptions: {
          maxAge: '1d',
        },
      },
      async (payload, done) => {
        const { id } = payload
        const result = await userService.findBy('id', id)
        if (result[0]) done(null, result[0])
        else done(null, false)
      },
    ),
  )

  app.use(passport.authenticate('jwt', { session: false }))
}
