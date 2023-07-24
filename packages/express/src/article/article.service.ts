import { pool } from '@/db'
import { QueryArticleDto } from './dto/article.dto'
import { Article } from './entity/article'

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

export async function findOne(slug: string, userId?: number): Promise<Article> {
  const res = pool.query(
    `SELECT a.id, a.slug, a.title, a.description, a.body, a.createAt, a.updateAt, a.authorId, user.username authorName, user.bio authorBio, user.image authorImage, rta.tagList, rta.favoritesCount
    FROM article a
      JOIN user ON user.id=a.authorId
      JOIN (
        SELECT articleId, count(*) favoritesCount, GROUP_CONCAT(tag.title) tagList
        FROM ref_tag_article rta JOIN tag ON rta.tagId=tag.id
        WHERE rta.status=1
        GROUP BY rta.articleId
      ) rta ON rta.articleId=a.id
    WHERE a.slug=?`,
    [slug],
  )
  const favListPromise = userId
    ? findUserFavorites(userId)
    : Promise.resolve([])
  return Promise.all([res, favListPromise]).then(
    ([res, favList]: [any, number[]]) => {
      const item = res[0]?.[0] as Article
      item.favorited = favList.includes(item.id)
      item.tagList = (item.tagList as any).split(',')
      return item
    },
  )
}

export async function findMany(
  query: QueryArticleDto,
  userId?: number,
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
  const count = pool.query(
    `SELECT count(a.id) articlesCount FROM article JOIN user ON user.id=a.authorId JOIN (SELECT rta.articleId FROM ref_tag_article rta JOIN tag ON rta.tagId=tag.id WHERE rta.status=1 ${tagSQL} GROUP BY rta.articleId) rta ON rta.articleId=a.id ${
      where.length ? 'WHERE ' + where.join(' AND ') : ''
    }`,
  )
  const res = pool.query(
    `
  SELECT a.id, a.slug, a.title, a.description, a.body, a.createAt, a.updateAt, a.authorId, user.username authorName, user.bio authorBio, user.image authorImage, rta.tagList, rta.favoritesCount
  FROM article a
    JOIN user ON user.id=a.authorId
    JOIN (SELECT articleId, count(*) favoritesCount, GROUP_CONCAT(tag.title) tagList FROM ref_tag_article rta JOIN tag ON rta.tagId=tag.id WHERE rta.status=1 ${tagSQL} GROUP BY rta.articleId) rta ON rta.articleId=a.id
  ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
  OFFSET ? LIMIT ?
  `,
    [query.offset ?? 0, query.limit ?? 20],
  )
  const favListPromise = userId
    ? findUserFavorites(userId)
    : Promise.resolve([])
  return Promise.all([res, count, favListPromise]).then(
    async ([res, countRes, favList]: [any, any, number[]]) => {
      return {
        articles: res[0]?.map((item: Article) => {
          item.favorited = favList.includes(item.id)
          item.tagList = (item.tagList as any).split(',')
          return item
        }),
        articlesCount: countRes[0]?.[0].articlesCount,
      }
    },
  )
}

export async function findUserFavorites(userId: number): Promise<number[]> {
  return pool
    .query('SELECT articleId FROM ref_favorite WHERE status=1 AND userId=?', [
      userId,
    ])
    .then((res) =>
      (res[0] as any).map((item: { articleId: number }) => item.articleId),
    )
}

export function create(data: any) {
  return pool.query('INSERT INTO article SET ?', [data])
}

export function update(slug: string, data: any) {
  return pool.query('UPDATE article SET ? WHERE slug=?', [data, slug])
}

export function remove(slug: string) {
  return pool.query('UPDATE article SET deleted=1 WHERE slug=?', [slug])
}

export function favorite(slug: string, userId: number) {
  return pool.query(
    'REPLACE INTO ref_favorite (status, articleId, userId) VALUES(1,(select articleId from article where slug=?),?)',
    [slug, userId],
  )
}

export function unfavorite(slug: string, userId: number) {
  return pool.query(
    'REPLACE INTO ref_favorite (status, articleId, userId) VALUES(0,(select articleId from article where slug=?),?)',
    [slug, userId],
  )
}
