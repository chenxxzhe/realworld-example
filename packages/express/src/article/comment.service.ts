import { pool } from '@/db'
import * as articleService from './article.service'

export function findMany(articleSlug: string, page = 1, size = 100) {
  const columns = [
    'c.id',
    'c.created_at',
    'c.updated_at',
    'c.body',
    'u.id',
    'u.username',
    'u.bio',
    'u.image',
  ]
  return pool.query(
    'SELECT ?? FROM comment c WHERE slug=? LIMIT ? OFFSET ? JOIN user u ON u.id=c.author_id',
    [columns, articleSlug, size, (page - 1) * size],
  )
}

export async function create(slug: string, data: any) {
  const article = await articleService.findOne(slug)
  data.articleId = article.id
  return pool.query('INSERT INTO comment SET ?', [data])
}

export function update(id: number, data: any) {
  return pool.query('UPDATE comment SET ? WHERE id=?', [data, id])
}

export function remove(id: number) {
  return pool.query('UPDATE comment SET deleted=1 WHERE id=?', [id])
}
