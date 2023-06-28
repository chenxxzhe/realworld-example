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

  findOne(where: Prisma.UserWhereUniqueInput, includePassword = false) {
    return this.p.user.findUnique({ where }).then((res) => {
      if (!res) return null
      if (!includePassword) {
        delete (res as any).password
      }
      return res
    })
  }
  findOneMoreDetail(where: Prisma.UserWhereUniqueInput) {
    return this.p.user.findUnique({
      where,
      include: { favorites: true, following: true, followedBy: true },
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.p.user
      .update({ where: { id }, data: updateUserDto })
      .then((res) => {
        const { password, ...rest } = res
        return rest
      })
  }

  remove(id: number) {
    return this.p.user.delete({ where: { id } })
  }

  follow(username: string, currentUserId: number) {
    return this.p.user.update({
      where: { username },
      data: {
        followedBy: {
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
        followedBy: {
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
