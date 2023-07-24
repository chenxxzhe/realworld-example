import { pool } from '@/db'
import { Tag } from './entity/tag'

const columns = ['id', 'title']

export function findOne(
  key: 'id' | 'title',
  value: string | number,
): Promise<Tag> {
  return pool
    .query('SELECT id, title FROM tag WHERE ?=?', [key, value])
    .then((res: any) => res[0]?.[0] as Tag)
}

export function findMany(page = 1, size = 100): Promise<Tag[]> {
  return pool
    .query('SELECT ?? FROM tag LIMIT ? OFFSET ?', [
      columns,
      size,
      (page - 1) * size,
    ])
    .then((res) => res[0] as Tag[])
}

export function createMany(tags: string[]): Promise<Tag[]> {
  return pool
    .query('INSERT IGNORE INTO tag values ?? RETURNING *', [tags])
    .then((res) => res[0] as Tag[])
}

export function remove(id: number) {
  return pool.query('UPDATE tag SET deleted=1 WHERE id=?', [id])
}
