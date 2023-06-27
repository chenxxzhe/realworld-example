import { Controller, Get, Param, Post, Delete, Request } from '@nestjs/common'
import { UserService } from './user.service'
import { Public } from '@/auth/public.decorator'
import { User } from '@prisma/client'

@Controller('profiles')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.userService.findOne({ username })
  }

  @Post(':username/follow')
  follow(@Param('username') username: string, @Request() req: { user: User }) {
    const { id } = req.user
    return this.userService.follow(username, id)
  }

  @Delete(':username/follow')
  unfollow(
    @Param('username') username: string,
    @Request() req: { user: User },
  ) {
    const { id } = req.user
    return this.userService.unfollow(username, id)
  }
}
