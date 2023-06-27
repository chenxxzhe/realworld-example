import { Controller, Get, Body, Put, Request } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from '@prisma/client'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post('/users')
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto)
  // }

  @Get()
  findCurrentUser(@Request() req: { user: User }) {
    return this.userService.findOne({ id: req.user.id })
  }

  @Put()
  updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: User },
  ) {
    return this.userService.update(req.user.id, updateUserDto)
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
