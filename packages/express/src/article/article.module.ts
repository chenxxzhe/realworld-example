import { setAuthFree } from '@/auth/auth.module'
import { validateBody, validateQuery } from '@/common/validator.middleware'
import { Router } from 'express'
import {
  CreateArticleDto,
  QueryArticleDto,
  QueryArticleFeedDto,
  UpdateArticleDto,
} from './dto/article.dto'
import { CreateCommentDto } from './dto/comment.dto'
import * as commentService from './comment.service'
import * as articleService from './article.service'

export const initArticleModule = (app: Router) => {
  const articles = Router()
  app.use('/articles', articles)
  // 获取 公共流 文章
  setAuthFree('GET', '/articles')
  articles.get('/', validateQuery(QueryArticleDto), async (req, res, next) => {
    const articles = await articleService.findMany(req.query, req.user?.id)
    res.json(articles)
  })
  // 获取当前用户 关注的用户 的文章
  articles.get(
    '/feed',
    validateQuery(QueryArticleFeedDto),
    async (req, res, next) => {
      const articles = await articleService.findMany(
        req.query,
        req.user?.id,
        true,
      )
      res.json(articles)
    },
  )
  // 获取 文章详情
  setAuthFree('GET', '/articles/:slug')
  articles.get('/:slug', async (req, res, next) => {
    const article = await articleService.findOne(req.params.slug, req.user?.id)
    res.json({ article })
  })
  // 创建
  articles.post('/', validateBody(CreateArticleDto), async (req, res, next) => {
    const body = req.body
    const article = await articleService.create(body.article, req.user!.id)
    res.json({ article })
  })
  // 更新
  articles.put(
    '/:slug',
    validateBody(UpdateArticleDto),
    async (req, res, next) => {
      const body = req.body
      const article = await articleService.update(
        req.params.slug,
        body.article,
        req.user!.id,
      )
      res.json({ article })
    },
  )
  // 删除
  articles.delete('/:slug', async (req, res, next) => {
    const detail = await articleService.remove(req.params.slug, req.user!.id)
    res.json({ detail })
  })
  // 添加 评论
  articles.post(
    '/:slug/comments',
    validateBody(CreateCommentDto),
    async (req, res, next) => {
      const comment = await commentService.create(
        req.params.slug,
        req.body.comment,
        req.user!.id,
      )
      res.json({ comment })
    },
  )
  // 获取 文章所有评论
  setAuthFree('GET', '/articles/:slug/comments')
  articles.get('/:slug/comments', async (req, res, next) => {
    const comments = await commentService.findMany(req.params.slug, 1, 20)
    res.json({ comments })
  })
  // 删除 评论
  articles.delete('/:slug/comments/:id', async (req, res, next) => {
    const detail = await commentService.remove(+req.params.id, req.user!.id)
    res.json({ detail })
  })
  // 收藏
  articles.post('/:slug/favorite', async (req, res, next) => {
    const article = await articleService.favorite(req.params.slug, req.user!.id)
    res.json({ article })
  })
  // 取消收藏
  articles.delete('/:slug/favorite', async (req, res, next) => {
    const article = await articleService.unfavorite(
      req.params.slug,
      req.user!.id,
    )
    res.json({ article })
  })
}
