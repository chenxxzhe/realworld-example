import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { TagService } from './tag.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { Public } from '@/auth/public.decorator'

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  createTag(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto)
  }

  @Public()
  @Get()
  getAllTags() {
    return this.tagService.getAll().then((res) => ({ tags: res }))
  }

  @Delete(':id')
  removeTag(@Param('id') id: string) {
    return this.tagService.remove(+id)
  }
}
