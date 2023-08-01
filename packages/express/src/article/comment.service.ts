import { pool } from '@/db'
import * as articleService from './article.service'
import { Comment } from './entity/comment'
import type { OkPacket, RowDataPacket } from 'mysql2'
import { User } from '@/user/entity/user'

/** 从 sql 查询出来的数据重新组装 author */
function extractAuthor(item: any): User {
  const author = {
    id: item.authorId,
    username: item.authorName,
    email: item.authorEmail,
    bio: item.authorBio,
    image: item.authorImage,
  } as User
  delete item.authorId
  delete item.authorName
  delete item.authorEmail
  delete item.authorBio
  delete item.authorImage
  delete item.authorFollowing
  return author
}

export function findOne(commentId: number): Promise<Comment> {
  return pool
    .query<RowDataPacket[]>(
      'SELECT c.id, c.body, c.createdAt, c.updatedAt, c.authorId, c.articleId, u.username authorName, u.bio authorBio, u.image authorImage FROM comment c JOIN user u ON u.id=c.authorId WHERE c.id=? AND c.deleted=0 LIMIT 1',
      [commentId],
    )
    .then((res) => {
      const comment = res[0]?.[0] as Comment
      comment.author = extractAuthor(comment)
      return comment
    })
}

export function findMany(
  slug: string,
  page = 1,
  size = 20,
): Promise<Comment[]> {
  return pool
    .query<RowDataPacket[]>(
      'SELECT c.id, c.body, c.createdAt, c.updatedAt, c.authorId, c.articleId, u.username authorName, u.bio authorBio, u.image authorImage FROM comment c JOIN user u ON u.id=c.authorId JOIN article a ON a.id=c.articleId AND a.slug=? WHERE c.deleted=0 LIMIT ? OFFSET ?',
      [slug, size, (page - 1) * size],
    )
    .then((res) => {
      return (res[0] as any[]).map((c: Comment) => {
        c.author = extractAuthor(c)
        return c
      })
    })
}

export async function create(slug: string, data: Comment, userId: number) {
  data.authorId = userId
  return pool
    .query<OkPacket>(
      'INSERT INTO comment SET ?, articleId=(SELECT id FROM article WHERE slug=? LIMIT 1)',
      [data, slug],
    )
    .then((res) => findOne(res[0].insertId))
    .catch((err) => {
      throw err
    })
}

export function update(id: number, data: any, userId: number) {
  return pool
    .query<OkPacket>(
      'UPDATE comment SET ? WHERE id=? AND deleted=0 AND authorId=?',
      [data, id, userId],
    )
    .then((res) => {
      if (res[0].affectedRows === 0)
        throw { statusCode: 403, message: 'Forbidden, you are not owner' }
      return findOne(id)
    })
}

export function remove(id: number, userId: number) {
  return pool
    .query<OkPacket>(
      'UPDATE comment SET deleted=1 WHERE id=? AND deleted=0 AND authorId=?',
      [id, userId],
    )
    .then((res) => {
      if (res[0].affectedRows === 0)
        throw { statusCode: 403, message: 'Forbidden, you are not owner' }
      return res[0]
    })
}
