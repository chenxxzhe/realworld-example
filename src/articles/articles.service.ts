import { Injectable, Query } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { Prisma } from '.prisma/client'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { QueryArticleDto } from './dto/query-article.dto'

@Injectable()
export class ArticlesService {
  constructor(private p: PrismaService) {}

  create(createArticleDto: CreateArticleDto, authorId: number) {
    const data = {
      ...createArticleDto,
      slug: this.title2Slug(createArticleDto.title),
      authorId,
    }
    return this.p.article.create({ data })
  }

  getIdFromSlug(slug: string) {
    return this.p.article
      .findFirst({ where: { slug }, select: { id: true } })
      .then((res) => res?.id ?? -1)
  }

  findAll(query: QueryArticleDto) {
    const where: Prisma.ArticleWhereInput = {}
    if (query.author) {
      where.author = { username: { contains: query.author } }
    }
    if (query.favorited) {
      where.favoritedBy = {
        some: { username: { contains: query.favorited } },
      }
    }
    if (query.tag) {
      where.tags = { some: { title: query.tag } }
    }
    return this.p.article.findMany({
      where,
      include: {
        favoritedBy: {
          select: { id: true },
        },
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
        tags: true,
      },
      take: query.limit ?? 20,
      skip: query.offset ?? 0,
    })
  }

  async findOne(slug: string) {
    const id = await this.getIdFromSlug(slug)
    return this.p.article.findUnique({ where: { id } })
  }

  async update(slug: string, updateArticleDto: UpdateArticleDto) {
    const id = await this.getIdFromSlug(slug)
    return this.p.article.update({ where: { id }, data: updateArticleDto })
  }

  async remove(slug: string) {
    const id = await this.getIdFromSlug(slug)
    return this.p.article.delete({ where: { id } })
  }

  favorite(slug: string, currentUserId: number) {
    return this.p.article.update({
      where: { slug },
      data: {
        favoritedBy: {
          connect: {
            id: currentUserId,
          },
        },
      },
    })
  }

  unfavorite(slug: string, currentUserId: number) {
    return this.p.article.update({
      where: { slug },
      data: {
        favoritedBy: {
          disconnect: {
            id: currentUserId,
          },
        },
      },
    })
  }

  private title2Slug(title: string) {
    return title.toLowerCase().replace(/\s/g, '-')
  }
}
