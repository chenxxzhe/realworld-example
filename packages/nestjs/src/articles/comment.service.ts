import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateCommentDto } from './dto/create-comment.dto'

@Injectable()
export class CommentService {
  constructor(private readonly p: PrismaService) {}

  async create(slug: string, dto: CreateCommentDto, currentUserId: number) {
    const article = await this.p.article.findUniqueOrThrow({
      where: { slug },
      select: { id: true },
    })
    return this.p.comment.create({
      data: {
        ...dto,
        article: { connect: { id: article.id } },
        author: { connect: { id: currentUserId } },
      },
      include: {
        author: true,
      },
    })
  }

  getAllFrom(slug: string) {
    return this.p.comment.findMany({
      where: {
        article: {
          slug,
        },
      },
      include: {
        author: true,
      },
    })
  }

  async remove(id: number, currentUserId: number) {
    await this.validateAuthor(id, currentUserId)
    return this.p.comment.delete({ where: { id } })
  }

  private async validateAuthor(commentId: number, authorId: number) {
    const res = await this.p.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })
    if (!res?.authorId || res.authorId !== authorId) {
      throw new UnauthorizedException('is not author')
    }
  }
}
