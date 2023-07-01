import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { Prisma, Article } from '.prisma/client'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { QueryArticleDto } from './dto/query-article.dto'
import { UserService } from '@/user/user.service'

const include = {
  _count: {
    select: {
      favoritedBy: true,
    },
  },
  author: {
    select: {
      id: true,
      username: true,
      bio: true,
      image: true,
    },
  },
  tagList: true,
} as const

function title2Slug(title: string) {
  return title.toLowerCase().replace(/\s/g, '-')
}

@Injectable()
export class ArticlesService {
  constructor(private p: PrismaService, private userService: UserService) {}

  async create(createArticleDto: CreateArticleDto, authorId: number) {
    const data: Prisma.ArticleCreateInput = {
      ...createArticleDto,
      slug: title2Slug(createArticleDto.title),
      author: { connect: { id: authorId } },
      tagList: {
        connectOrCreate: createArticleDto.tagList.map((title) => ({
          where: { title },
          create: { title },
        })),
      },
    }
    return this.p.article
      .create({
        data,
        include,
      })
      .then((item) => {
        Object.assign(item, {
          // 当前用户是否喜爱
          favorited: false,
          // 文章喜爱总数
          favoritesCount: item._count.favoritedBy,
        })
        return item
      })
  }

  async findAll(
    query: QueryArticleDto,
    currentUserId?: number,
    ownFeed = false,
  ) {
    const [mapper, followList] = await this.mapArticle(currentUserId)

    const where: Prisma.ArticleWhereInput = {}
    // 只获取 当前用户 关注的作者文章
    if (ownFeed) {
      where.authorId = { in: followList }
    }
    if (query.author) {
      where.author = { username: { contains: query.author } }
    }
    // 某个人的喜爱列表
    if (query.favorited) {
      where.favoritedBy = { some: { username: query.favorited } }
    }
    if (query.tag) {
      where.tagList = { some: { title: query.tag } }
    }
    const [articles, articlesCount] = await this.p.$transaction([
      this.p.article.findMany({
        where,
        include,
        take: query.limit ?? 20,
        skip: query.offset ?? 0,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.p.article.count({ where }),
    ])
    return {
      articles: articles.map(mapper),
      articlesCount,
    }
  }

  async findOne(slug: string, currentUserId?: number) {
    const [mapper] = await this.mapArticle(currentUserId)
    return this.p.article
      .findUnique({
        where: { slug },
        include: {
          ...include,
          comments: true,
        },
      })
      .then(mapper)
  }

  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    currentUserId: number,
  ) {
    await this.validateAuthor({ slug }, currentUserId)

    const data: Prisma.ArticleUpdateInput = {
      ...updateArticleDto,
    }
    if (updateArticleDto.title) {
      data.slug = title2Slug(updateArticleDto.title)
    }

    const [mapper] = await this.mapArticle(currentUserId)
    return this.p.article
      .update({ where: { slug }, data, include })
      .then(mapper)
  }

  async remove(slug: string, currentUserId: number) {
    await this.validateAuthor({ slug }, currentUserId)
    // const [mapper] = await this.mapArticle(currentUserId)
    return this.p.article.delete({
      where: { slug },
    })
  }

  async favorite(slug: string, currentUserId: number) {
    const res = await this.p.article.update({
      where: { slug },
      include,
      data: {
        favoritedBy: {
          connect: {
            id: currentUserId,
          },
        },
      },
    })
    const [mapper] = await this.mapArticle(currentUserId)
    return mapper(res)
  }

  async unfavorite(slug: string, currentUserId: number) {
    const res = await this.p.article.update({
      where: { slug },
      include,
      data: {
        favoritedBy: {
          disconnect: {
            id: currentUserId,
          },
        },
      },
    })
    const [mapper] = await this.mapArticle(currentUserId)
    return mapper(res)
  }

  private async mapArticle(currentUserId?: number) {
    let followList: number[] = []
    let favList: number[] = []
    if (currentUserId) {
      const user = await this.userService.findOneMoreDetail({
        id: currentUserId,
      })
      if (user) {
        followList = user.following.map((u) => u.id)
        favList = user.favorites.map((a) => a.id)
      }
    }
    const mapper = (item: (Article & { _count: any; author: any }) | null) => {
      if (!item) return null
      Object.assign(item, {
        // 当前用户是否喜爱
        favorited: favList.includes(item.id),
        // 文章喜爱总数
        favoritesCount: item._count.favoritedBy,
      })
      Object.assign(item.author, {
        following: followList.includes(item.author.id),
      })
      return item
    }
    return [mapper, followList, favList] as const
  }

  private async validateAuthor(
    where: Prisma.ArticleWhereUniqueInput,
    authorId: number,
  ) {
    const res = await this.p.article.findUnique({
      where,
      select: { authorId: true },
    })
    if (!res?.authorId || res.authorId !== authorId) {
      throw new UnauthorizedException('is not author')
    }
  }
}
