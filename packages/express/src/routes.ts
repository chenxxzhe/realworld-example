import { Express, Router } from 'express'
import { initUserModule } from '@/user/user.module'
import { initArticleModule } from '@/article/article.module'
import { initTagModule } from '@/tag/tag.module'
import { initAuthModule } from './auth/auth.module'

export const initRouter = (prefix: string, app: Express) => {
  const api = Router()

  // 注册各模块路由
  initAuthModule(api)
  initUserModule(api)
  initArticleModule(api)
  initTagModule(api)

  // 安装到 root
  app.use(prefix, api)
}
