import { pool } from '@/db'
import { QueryArticleDto } from './dto/article.dto'
import { Article } from './entity/article'
import * as tagService from '@/tag/tag.service'
import { OkPacket } from 'mysql2'
import { User } from '@/user/entity/user'
import { Tag } from '@/tag/entity/tag'

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

// ref_follow 关注关系表
// ref_favorite 收藏关系表
// ref_tag_article 文章标签关系表
interface QueryArticleSQLParams {
  userId: number
  tag?: string
  where?: string[]
  limit?: number
  offset?: number
  feed?: boolean
  count?: boolean
}
/** 创建查询 article 的 SQL, 有多个过滤条件 */
const queryArticleSQL = ({
  userId,
  where,
  limit,
  offset,
  tag,
  feed,
  count,
}: QueryArticleSQLParams) => {
  const followingCount = feed
    ? '1'
    : `EXISTS(
      SELECT id FROM ref_follow
      WHERE status=1
        AND target=a.authorId
        AND follower=${pool.escape(userId)}
    )`
  const selectStatement = count
    ? 'COUNT(a.id) articlesCount'
    : `a.id, a.slug, a.title, a.description, a.body, a.createdAt, a.updatedAt, a.authorId, user.email authorEmail, user.username authorName, user.bio authorBio, user.image authorImage, rta.tagList, ifnull(rf.favoritesCount,0) favoritesCount,
    ${followingCount} authorFollowing`
  const additionInfo = count
    ? ''
    : `
      LEFT JOIN (
        SELECT articleId, GROUP_CONCAT(tag.title ORDER BY tag.title) tagList
        FROM ref_tag_article rta
        JOIN tag ON rta.tagId=tag.id
        WHERE rta.status=1
        GROUP BY rta.articleId
      ) rta ON rta.articleId=a.id
      LEFT JOIN (
        SELECT articleId, count(*) favoritesCount
        FROM ref_favorite
        GROUP BY articleId
      ) rf on rf.articleId=a.id
    `
  const tagFilter = tag
    ? `JOIN (
      SELECT articleId
      FROM ref_tag_article rta
        JOIN tag ON rta.tagId=tag.id
      WHERE rta.status=1 AND tag.title=${pool.escape(tag)}
      GROUP BY rta.articleId
    ) rta0 ON rta0.articleId=a.id`
    : ''
  const feedFilter = feed
    ? 'JOIN ref_follow rfo ON rfo.target=a.authorId AND rfo.follower=' +
      pool.escape(userId)
    : ''
  const whereStatement =
    'WHERE a.deleted=0' + (where?.length ? ' AND ' + where.join(' AND ') : '')
  const limitStatement = count
    ? ''
    : `
    ORDER BY a.updatedAt
    LIMIT ${pool.escape(limit || 20)} OFFSET ${pool.escape(offset || 0)}
    `

  return `
    SELECT ${selectStatement}
    FROM article a
      JOIN user ON user.id=a.authorId
      ${tagFilter}
      ${feedFilter}
      ${additionInfo}
    ${whereStatement}
    ${limitStatement}
  `
}

/** 从 sql 查询出来的数据重新组装 author */
function extractAuthor(item: any): User {
  const author = {
    id: item.authorId,
    username: item.authorName,
    email: item.authorEmail,
    bio: item.authorBio,
    image: item.authorImage,
    following: !!item.authorFollowing,
  } as User
  delete item.authorId
  delete item.authorName
  delete item.authorEmail
  delete item.authorBio
  delete item.authorImage
  delete item.authorFollowing
  return author
}

function handleRawArticleFromDB(item: any, favList: number[]) {
  if (!item) return
  item.author = extractAuthor(item)
  item.favorited = favList.includes(item.id)
  item.tagList = (item.tagList as string) ? item.tagList.split(',') : []
}

export async function findOne(slug: string, userId = 0): Promise<Article> {
  const sql = queryArticleSQL({
    userId,
    limit: 1,
    where: [`a.slug=${pool.escape(slug)}`],
  })
  const res = pool.query(sql)
  const favListPromise = userId
    ? findUserFavorites(userId)
    : Promise.resolve([])
  return Promise.all([res, favListPromise]).then(
    ([res, favList]: [any, number[]]) => {
      const item = res[0]?.[0] as Article
      handleRawArticleFromDB(item, favList)
      return item
    },
  )
}

export async function findMany(
  query: QueryArticleDto,
  userId = 0,
  feed = false,
): Promise<{ articles: Article[]; articlesCount: number }> {
  const where: string[] = []
  if (query.favorited) {
    // 按某用户的收藏过滤
    const sql = `(SELECT articleId FROM ref_favorite WHERE status=1 AND userId=(SELECT id FROM user WHERE username=${pool.escape(
      query.favorited,
    )} LIMIT 1))`
    where.push(`a.id IN ${sql}`)
  }
  if (query.author) {
    // 按作者过滤
    where.push(`user.username=${pool.escape(query.author)}`)
  }
  const count = pool.query(
    queryArticleSQL({ userId, where, tag: query.tag, feed, count: true }),
  )
  const res = pool.query(
    queryArticleSQL({
      userId,
      tag: query.tag,
      where,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      feed,
    }),
  )
  const favListPromise = userId
    ? findUserFavorites(userId)
    : Promise.resolve([])
  return Promise.all([res, count, favListPromise])
    .then(async ([res, countRes, favList]: [any, any, number[]]) => {
      return {
        articles: res[0]?.map((item: Article) => {
          handleRawArticleFromDB(item, favList)
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
  const res = await pool.query<OkPacket>('INSERT INTO article SET ?', [data])
  // 插入数据, 更新 ref_tag_article
  await tagService.bindTags(
    res[0].insertId,
    tags.map((t) => t.id),
  )
  return findOne(data.slug, userId)
}

export async function update(slug: string, data: Article, userId: number) {
  if (data.title) {
    data.slug = title2Slug(data.title)
  }
  let tags: Tag[] = []
  if (data.tagList) {
    tags = await handleTags(data)
  }

  return pool
    .query<OkPacket>('UPDATE article SET ? WHERE slug=? AND authorId=?', [
      data,
      slug,
      userId,
    ])
    .then((res) => {
      if (res[0].affectedRows === 0)
        throw { statusCode: 403, message: 'Forbidden, you are not owner' }
      return findOne(slug, userId)
    })
    .then(async (res) => {
      if (
        data.tagList !== undefined &&
        res.tagList.toString() !== tags.map((t) => t.title).toString()
      ) {
        // 解绑, 新绑
        await tagService.unbindAllTags(res.id)
        await tagService.bindTags(
          res.id,
          tags.map((t) => t.id),
        )
        res.tagList = tags.map((t) => t.title)
        return res
      }
      return res
    })
}

export function remove(slug: string, userId: number) {
  return pool
    .query<OkPacket>(
      'UPDATE article SET deleted=1 WHERE slug=? AND deleted=0 AND authorId=?',
      [slug, userId],
    )
    .then((res) => {
      if (res[0].affectedRows === 0)
        throw { statusCode: 403, message: 'Forbidden, you are not owner' }
      return res[0]
    })
}

export function favorite(slug: string, userId: number) {
  return pool
    .query(
      'INSERT INTO ref_favorite (status, articleId, userId) VALUES(1,(select id from article where slug=? LIMIT 1),?) ON DUPLICATE KEY UPDATE status=1',
      [slug, userId],
    )
    .then(() => {
      return findOne(slug, userId)
    })
}

export function unfavorite(slug: string, userId: number) {
  return pool
    .query(
      'UPDATE ref_favorite SET status=0 WHERE articleId=(select id from article where slug=? LIMIT 1) AND userId=?',
      [slug, userId],
    )
    .then(() => {
      return findOne(slug, userId)
    })
}

function handleTags(item: Article) {
  const tags = item.tagList
  delete (item as any).tagList
  return tagService.createMany(tags)
}

function title2Slug(title: string): string {
  return title.toLowerCase().replaceAll(/\s+/g, '-')
}
