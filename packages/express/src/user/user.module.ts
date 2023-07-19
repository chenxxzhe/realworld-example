import type { ResultSetHeader } from 'mysql2'
import { Router } from 'express'
import passport from 'passport'
import crypto from 'bcrypt'

import * as userService from './user.service'
import { setAuthFree } from '@/auth/auth.module'
import { signToken } from '@/auth/auth.service'
import { validateBody } from '@/common/validator.middleware'
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto/user.dto'

export const initUserModule = (app: Router) => {
  const users = Router()
  app.use('/users', users)

  // 登录
  setAuthFree('POST', '/users/login')
  users.post(
    '/login',
    validateBody(LoginUserDto),
    passport.authenticate('local', { session: false }),
    (req, res, next) => {
      const user = req.user!
      const token = signToken(user)
      res.json({ user: { ...user, token } })
    },
  )

  // 注册
  setAuthFree('POST', '/users')
  users.post('/', validateBody(CreateUserDto), async (req, res) => {
    const body = req.body.user
    body.password = await crypto.hash(body.password, 10)
    const [result] = await userService.create(body)
    const id = (result as ResultSetHeader).insertId
    const token = signToken({ id })
    res.status(201).json({
      user: {
        id,
        email: body.email,
        username: body.username,
        bio: body.bio,
        image: body.image,
        token,
      },
    })
  })

  const user = Router()
  app.use('/user', user)

  // 当前用户
  // {
  //   "user": {
  //     "email": "jake@jake.jake",
  //     "token": "jwt.token.here",
  //     "username": "jake",
  //     "bio": "I work at statefarm",
  //     "image": null
  //   }
  // }
  user.get('/', async (req, res) => {
    const user = req.user!
    res.send({ user })
  })

  // 修改当前用户
  user.put('/', validateBody(UpdateUserDto), async (req, res) => {
    const result = await userService.update(req.user!.id, req.body?.user)
    res.send({ user: { ...req.user, ...req.body.user } })
  })

  const profiles = Router()
  app.use('/profiles', profiles)

  // 用户详情
  // {
  //   "profile": {
  //     "username": "jake",
  //     "bio": "I work at statefarm",
  //     "image": "https://api.realworld.io/images/smiley-cyrus.jpg",
  //     "following": false
  //   }
  // }
  profiles.get('/:username', async (req, res) => {
    const user = await userService.findBy(
      'username',
      req.params.username,
      req.user?.id,
    )
    user.following = !!user.following
    res.send({ user })
  })

  // 关注用户
  profiles.post('/:username/follow', async (req, res) => {
    const username = req.params.username
    const target = await userService.findBy('username', username)
    await userService.follow(target.id, req.user!.id)
    target.following = true
    res.send({ user: target })
  })

  // 取消关注
  profiles.delete('/:username/follow', async (req, res) => {
    req.user
    const username = req.params.username
    const target = await userService.findBy('username', username)
    await userService.unfollow(target.id, req.user!.id)
    target.following = false
    res.send({ user: target })
  })
}
