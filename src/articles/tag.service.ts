import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

import { CreateTagDto } from './dto/create-tag.dto'

@Injectable()
export class TagService {
  constructor(private readonly p: PrismaService) {}

  create(dto: CreateTagDto) {
    return this.p.tag.create({ data: dto })
  }

  getAll() {
    return this.p.tag.findMany()
  }

  remove(id: number) {
    return this.p.tag.delete({ where: { id } })
  }
}
