import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Request,
} from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { QueryArticleDto } from './dto/query-article.dto'
import { CommentService } from './comment.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { Public } from '@/auth/public.decorator'
import { User } from '@prisma/client'
import { UserService } from '@/user/user.service'

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
  ) {}

  @Post()
  create(
    @Body('article') createArticleDto: CreateArticleDto,
    @Request() req: { user: User },
  ) {
    return this.articlesService
      .create(createArticleDto, req.user.id)
      .then((res) => ({ article: res }))
  }

  @Public()
  @Get()
  async globalFeed(
    @Query() query: QueryArticleDto,
    @Request() req: { user?: User },
  ) {
    return this.articlesService.findAll(query, req.user?.id)
  }

  @Get('feed')
  ownFeed(@Query() query: QueryArticleDto, @Request() req: { user: User }) {
    return this.articlesService.findAll(query, req.user.id, true)
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string, @Request() req: { user: User }) {
    return this.articlesService
      .findOne(slug, req.user?.id)
      .then((res) => ({ article: res }))
  }

  @Put(':slug')
  update(
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
    @Request() req: { user: User },
  ) {
    return this.articlesService
      .update(slug, updateArticleDto, req.user.id)
      .then((res) => ({ article: res }))
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string, @Request() req: { user: User }) {
    return this.articlesService
      .remove(slug, req.user.id)
      .then((res) => ({ article: res }))
  }

  @Post(':slug/favorite')
  favorite(@Param('slug') slug: string, @Request() req: { user: User }) {
    return this.articlesService
      .favorite(slug, req.user.id)
      .then((res) => ({ article: res }))
  }

  @Delete(':slug/favorite')
  unfavorite(@Param('slug') slug: string, @Request() req: { user: User }) {
    return this.articlesService
      .unfavorite(slug, req.user.id)
      .then((res) => ({ article: res }))
  }

  @Post(':slug/comments')
  createComment(
    @Param('slug') slug: string,
    @Body('comment') dto: CreateCommentDto,
    @Request() req: { user: User },
  ) {
    return this.commentService
      .create(slug, dto, req.user.id)
      .then((res) => ({ comment: res }))
  }

  @Public()
  @Get(':slug/comments')
  getComments(@Param('slug') slug: string) {
    return this.commentService
      .getAllFrom(slug)
      .then((res) => ({ comments: res }))
  }

  @Delete(':slug/comments/:id')
  removeComment(@Param('id') id: string, @Request() req: { user: User }) {
    return this.commentService
      .remove(+id, req.user.id)
      .then((res) => ({ comment: res }))
  }
}
