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
    .query('INSERT IGNORE INTO tag(title) VALUES ?', [tags.map((t) => [t])])
    .then(() => {
      return pool.query(
        'SELECT id,title FROM tag WHERE deleted=0 AND title IN ?',
        [[tags]],
      )
    })
    .then((res) => res[0] as Tag[])
}

export function remove(id: number) {
  return pool.query('UPDATE tag SET deleted=1 WHERE id=?', [id])
}

export function bindTags(articleId: number, tagIdList: number[]) {
  if (!tagIdList.length) return Promise.resolve()
  return pool
    .query(
      'INSERT INTO ref_tag_article (tagId, articleId, status) VALUES ? ON DUPLICATE KEY UPDATE status=VALUES(status)',
      [tagIdList.map((id) => [id, articleId, 1]), ,],
    )
    .catch((err) => {
      throw err
    })
}

export function unbindAllTags(articleId: number) {
  return pool
    .query('UPDATE ref_tag_article SET status=0 WHERE articleId=?', articleId)
    .catch((err) => {
      throw err
    })
}
