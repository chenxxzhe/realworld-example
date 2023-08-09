import { Article, User, Tag, Comment } from '@/entity'
import { get, post, put, del } from './request'

// Articles
export const getArticleList = () => {
  return get<{ articles: Article[]; articlesCount: number }>('/articles')
}

export const getArticleFeed = () => {
  return get<{ articles: Article[]; articlesCount: number }>('/articles/feed')
}

export const getArticleDetail = (slug: string) => {
  return get<{ article: Article }>('/articles/' + slug)
}

export const upsertArticle = (data: Article, slug?: string) => {
  return slug
    ? put<{ article: Article }>('/articles/' + slug, { article: data })
    : post<{ article: Article }>('/articles', { article: data })
}

export const deleteArticle = (slug: string) => {
  return del<{ article: Article }>('/articles/' + slug)
}

export const favorite = (slug: string) => {
  return post<{ article: Article }>(`/articles/${slug}/favorite`)
}

export const unfavorite = (slug: string) => {
  return del<{ article: Article }>(`/articles/${slug}/favorite`)
}

export const getCommentList = (slug: string) => {
  return get<{ comments: Comment[] }>(`/articles/${slug}/comments`)
}

export const createComment = (slug: string, data: Partial<Comment>) => {
  return post<{ comment: Comment }>(`/articles/${slug}/comments`, {
    comment: data,
  })
}
export const deleteComment = (slug: string, id: number) => {
  return del<{ comment: Comment }>(`/articles/${slug}/comments/${id}`)
}

// Tag

export const getTagList = () => get<Tag[]>('/tags')

// User

export const login = (email: string, password: string) => {
  return post<{ user: User }>('/users/login', { user: { email, password } })
}

export const register = (data: {
  username: string
  email: string
  password: string
}) => {
  return post<{ user: User }>('/users', { user: data })
}

export const getCurrentUser = () => {
  return get<{ user: User }>('/user')
}

export const updateCurrentUser = (data: Partial<User>) => {
  return post<{ user: User }>('/user', { user: data })
}

// Profile

export const getProfile = (username: string) => {
  return get<{ user: User }>('/profiles/' + username)
}

export const follow = (username: string) => {
  return post<{ user: User }>(`/profiles/${username}/follow`)
}

export const unfollow = (username: string) => {
  return del<{ user: User }>(`/profiles/${username}/follow`)
}
