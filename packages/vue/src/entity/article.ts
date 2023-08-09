import { User } from './user'

export class Article {
  id: number
  slug: string
  title: string
  description: string
  body: string
  tagList: string[]
  createAt: string
  updateAt: string
  authorId: number
  author: User
  /** 当前用户是否收藏该文章 */
  favorited: boolean
  /** 总被收藏数 */
  favoritesCount: number
}
