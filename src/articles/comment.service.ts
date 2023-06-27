import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateCommentDto } from './dto/create-comment.dto'

@Injectable()
export class CommentService {
  constructor(private readonly p: PrismaService) {}

  async create(articleSlug: string, dto: CreateCommentDto, authorId: number) {
    const article = await this.p.article.findFirstOrThrow({
      where: { slug: articleSlug },
      select: { id: true },
    })
    return this.p.comment.create({
      data: {
        ...dto,
        articleId: article!.id,
        authorId,
      },
    })
  }

  getAllFrom(articleSlug: string) {
    return this.p.comment.findMany({
      where: {
        article: {
          slug: articleSlug,
        },
      },
    })
  }

  remove(id: number) {
    return this.p.comment.delete({ where: { id } })
  }
}
