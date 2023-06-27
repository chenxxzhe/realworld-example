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

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly commentService: CommentService,
  ) {}

  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req: { user: User },
  ) {
    return this.articlesService.create(createArticleDto, req.user.id)
  }

  @Public()
  @Get()
  globalFeed(@Query() query: QueryArticleDto) {
    return this.articlesService.findAll(query)
  }

  @Get('feed')
  ownFeed(@Query() query: QueryArticleDto) {
    return this.articlesService.findAll(query)
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findOne(slug)
  }

  @Put(':slug')
  update(
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(slug, updateArticleDto)
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.articlesService.remove(slug)
  }

  @Post(':slug/favorite')
  favorite(@Param('slug') slug: string, @Request() req: { user: User }) {
    return this.articlesService.favorite(slug, req.user.id)
  }

  @Delete(':slug/favorite')
  unfavorite(@Param('slug') slug: string, @Request() req: { user: User }) {
    return this.articlesService.unfavorite(slug, req.user.id)
  }

  @Post(':slug/comments')
  createComment(
    @Param('slug') slug: string,
    dto: CreateCommentDto,
    @Request() req: { user: User },
  ) {
    return this.commentService.create(slug, dto, req.user.id)
  }

  @Public()
  @Get(':slug/comments')
  getComments(@Param('slug') slug: string) {
    return this.commentService.getAllFrom(slug)
  }

  @Delete(':slug/comments/:id')
  removeComment(@Param('id') id: string) {
    return this.commentService.remove(+id)
  }
}
