import { pool } from '@/db'
import { QueryArticleDto } from './dto/article.dto'
import { Article } from './entity/article'
import * as tagService from '@/tag/tag.service'
import { OkPacket } from 'mysql2'
import { User } from '@/user/entity/user'

// {
//   "article": {
//     "slug": "how-to-train-your-dragon",
//     "title": "How to train your dragon",
//     "description": "Ever wonder how?",
//     "body": "It takes a Jacobian",
//     "tagList": ["dragons", "training"],
//     "createdAt": "2016-02-18T03:22:56.637Z",
//     "updatedAt": "2016-02-18T03:48:35.824Z",
//     "favorited": false,
//     "favoritesCount": 0,
//     "author": {
//       "username": "jake",
//       "bio": "I work at statefarm",
//       "image": "https://i.stack.imgur.com/xHWG8.jpg",
//       "following": false
//     }
//   }
// }

// ref_favorite 收藏关系表
// ref_tag_article 文章标签关系表
interface QueryArticleSQLParams {
  userId: number
  tagSQL?: string
  where?: string[]
  limit?: number
  offset?: number
}
const queryArticleSQL = ({
  userId,
  tagSQL,
  where,
  limit,
  offset,
}: QueryArticleSQLParams) => `
  SELECT a.id, a.slug, a.title, a.description, a.body, a.createdAt, a.updatedAt, a.authorId, user.email authorEmail, user.username authorName, user.bio authorBio, user.image authorImage, rta.tagList, ifnull(rf.favoritesCount,0) favoritesCount,
  EXISTS(
    SELECT id FROM ref_follow
    WHERE status=1
      AND target=a.authorId
      AND follower=${pool.escape(userId)}
  ) following
  FROM article a
    JOIN user ON user.id=a.authorId
    JOIN (
      SELECT articleId, GROUP_CONCAT(tag.title) tagList
      FROM ref_tag_article rta
      JOIN tag ON rta.tagId=tag.id
      WHERE rta.status=1 ${tagSQL || ''}
      GROUP BY rta.articleId
    ) rta ON rta.articleId=a.id
    LEFT JOIN (
      SELECT articleId, count(*) favoritesCount
      FROM ref_favorite
      GROUP BY articleId
    ) rf on rf.articleId=a.id
  ${where?.length ? 'WHERE ' + where.join(' AND ') : ''}
  LIMIT ${pool.escape(limit || 1)} OFFSET ${pool.escape(offset || 0)}
`

/** 从 sql 查询出来的数据重新组装 author */
function extractAuthor(item: any): User {
  const author = {
    id: item.authorId,
    username: item.authorName,
    email: item.authorEmail,
    bio: item.authorBio,
    image: item.authorImage,
    following: !!item.following,
  } as User
  delete item.authorId
  delete item.authorName
  delete item.authorEmail
  delete item.authorBio
  delete item.authorImage
  delete item.following
  return author
}

export async function findOne(slug: string, userId = 0): Promise<Article> {
  const res = pool.query(
    queryArticleSQL({ userId, where: [`a.slug=${pool.escape(slug)}`] }),
  )
  const favListPromise = userId
    ? findUserFavorites(userId)
    : Promise.resolve([])
  return Promise.all([res, favListPromise]).then(
    ([res, favList]: [any, number[]]) => {
      const item = res[0]?.[0] as Article
      item.author = extractAuthor(item)
      item.favorited = favList.includes(item.id)
      item.tagList = (item.tagList as any).split(',')
      return item
    },
  )
}

export async function findMany(
  query: QueryArticleDto,
  userId = 0,
): Promise<{ articles: Article[]; articlesCount: number }> {
  const where: string[] = []
  if (query.favorited) {
    // 按某用户的收藏过滤
    const sql = `(SELECT articleId FROM ref_favorite WHERE status=1 AND userId=(SELECT id FROM user WHERE username=${pool.escape(
      query.favorited,
    )} LIMIT 1))`
    where.push(`a.id IN ${sql}`)
  }
  let tagSQL = ''
  if (query.tag) {
    // 按标签过滤
    tagSQL = `AND tag.title=${pool.escape(query.tag)}`
  }
  if (query.author) {
    // 按作者过滤
    where.push(`user.username=${pool.escape(query.author)}`)
  }
  const count = pool.query(`
    SELECT count(a.id) articlesCount
    FROM article a
      JOIN user ON user.id=a.authorId
      JOIN (
        SELECT rta.articleId
        FROM ref_tag_article rta
          JOIN tag ON rta.tagId=tag.id
        WHERE rta.status=1 ${tagSQL}
        GROUP BY rta.articleId
      ) rta ON rta.articleId=a.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
  `)
  const res = pool.query(
    queryArticleSQL({
      userId,
      tagSQL,
      where,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    }),
  )
  const favListPromise = userId
    ? findUserFavorites(userId)
    : Promise.resolve([])
  return Promise.all([res, count, favListPromise])
    .then(async ([res, countRes, favList]: [any, any, number[]]) => {
      return {
        articles: res[0]?.map((item: Article) => {
          item.author = extractAuthor(item)
          item.favorited = favList.includes(item.id)
          item.tagList = (item.tagList as any).split(',')
          return item
        }),
        articlesCount: countRes[0]?.[0].articlesCount,
      }
    })
    .catch((err) => {
      throw err
    })
}

/** 查找某个用户的所有收藏文章 */
export async function findUserFavorites(userId: number): Promise<number[]> {
  return pool
    .query('SELECT articleId FROM ref_favorite WHERE status=1 AND userId=?', [
      userId,
    ])
    .then((res) =>
      (res[0] as any).map((item: { articleId: number }) => item.articleId),
    )
}

export async function create(data: Article, userId: number): Promise<Article> {
  data.slug = title2Slug(data.title)
  data.authorId = userId
  // 获取 tags id, 没有就新建
  const tags = await handleTags(data)
  return pool
    .query('INSERT INTO article SET ?', [data])
    .then((res) => {
      // 插入数据, 更新 ref_tag_article
      const result = res[0] as OkPacket
      return tagService.bindTags(
        result.insertId,
        tags.map((t) => t.id),
      )
    })
    .then(() => {
      return findOne(data.slug, userId)
    })
}

export function update(slug: string, data: Article) {
  data.slug = title2Slug(data.title)
  return pool.query('UPDATE article SET ? WHERE slug=?', [data, slug])
}

export function remove(slug: string) {
  return pool.query('UPDATE article SET deleted=1 WHERE slug=?', [slug])
}

export function favorite(slug: string, userId: number) {
  return pool.query(
    'INSERT INTO ref_favorite (status, articleId, userId) VALUES(1,(select id from article where slug=? LIMIT 1),?) ON DUPLICATE KEY UPDATE status=1',
    [slug, userId],
  )
}

export function unfavorite(slug: string, userId: number) {
  return pool.query(
    'UPDATE ref_favorite SET status=0 WHERE articleId=(select id from article where slug=? LIMIT 1) AND userId=?',
    [slug, userId],
  )
}

function handleTags(item: Article) {
  const tags = item.tagList
  delete (item as any).tagList
  return tagService.createMany(tags)
}

function title2Slug(title: string): string {
  return title.toLowerCase().replaceAll(/\s+/g, '-')
}
