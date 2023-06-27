import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Prisma } from '.prisma/client'
import { PrismaService } from 'nestjs-prisma'
import * as md5 from 'md5'

@Injectable()
export class UserService {
  constructor(private p: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const data: Prisma.UserCreateInput = {
      ...createUserDto,
      password: this.encryptPassword(createUserDto.password),
    }

    return this.p.user
      .create({
        data,
      })
      .then((res) => {
        const { password, ...rest } = res
        return rest
      })
  }

  findOne(where: Prisma.UserWhereUniqueInput) {
    return this.p.user.findUnique({ where })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.p.user.update({ where: { id }, data: updateUserDto })
  }

  remove(id: number) {
    return this.p.user.delete({ where: { id } })
  }

  follow(username: string, currentUserId: number) {
    return this.p.user.update({
      where: { username },
      data: {
        favorites: {
          connect: {
            id: currentUserId,
          },
        },
      },
    })
  }

  unfollow(username: string, currentUserId: number) {
    return this.p.user.update({
      where: { username },
      data: {
        favorites: {
          disconnect: {
            id: currentUserId,
          },
        },
      },
    })
  }

  encryptPassword(password: string) {
    return md5(password)
  }
}
