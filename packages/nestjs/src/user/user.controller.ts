import { Controller, Get, Body, Put, Request } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from '@prisma/client'
import { Request as Req } from 'express'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Post('/users')
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto)
  // }

  @Get()
  async findCurrentUser(@Request() req: Req & { user: User }) {
    const res = await this.userService.findOne({ id: req.user.id })
    if (!res) return null
    const token = req.headers.authorization?.slice(7)
    return {
      user: {
        ...res,
        token,
      },
    }
  }

  @Put()
  updateCurrentUser(
    @Body('user') updateUserDto: UpdateUserDto,
    @Request() req: Req & { user: User },
  ) {
    return this.userService.update(req.user.id, updateUserDto).then((res) => ({
      user: {
        ...res,
        token: req.headers.authorization?.slice(7),
      },
    }))
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id)
  // }
}
