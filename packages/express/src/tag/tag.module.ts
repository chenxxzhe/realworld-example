import { validateBody } from '@/common/validator.middleware'
import { Router } from 'express'
import { CreateTagDto } from './dto/tag.dto'
import * as tagService from './tag.service'
import { setAuthFree } from '@/auth/auth.module'

export const initTagModule = (app: Router) => {
  const tags = Router()
  app.use('/tags', tags)
  setAuthFree('GET', '/tags')
  tags.get('/', async (req, res) => {
    const tags = await tagService.findMany(1, 1000)
    res.json({ tags })
  })
  // 批量创建 tag
  tags.post('/', validateBody(CreateTagDto), async (req, res) => {
    const tags = await tagService.createMany(req.body.tags)
    res.json({ tags })
  })
  // 删除
  // TODO: 角色检查 admin
  tags.delete('/:id', async (req, res) => {
    const result = await tagService.remove(+req.params.id)
    res.json({ code: 200, result })
  })
}
