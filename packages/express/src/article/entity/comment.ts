import { User } from '@/user/entity/user'

export class Comment {
  id: number
  body: string
  articleId: number
  authorId: number
  author: User
  createAt: string
  updateAt: string
}
