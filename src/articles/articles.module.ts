import { Module } from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { ArticlesController } from './articles.controller'
import { CommentService } from './comment.service'
import { TagService } from './tag.service'
import { TagController } from './tag.controller'
import { UserModule } from '@/user/user.module'

@Module({
  imports: [UserModule],
  controllers: [ArticlesController, TagController],
  providers: [ArticlesService, CommentService, TagService],
})
export class ArticlesModule {}
