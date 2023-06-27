import {
  Body,
  Controller,
  Delete,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserService } from '@/user/user.service'
import { CreateUserDto } from '@/user/dto/create-user.dto'
import type { User } from '@prisma/client'
import { Public } from './public.decorator'
import { LoginDto } from './dto/login.dto'

@Controller('users')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  login(@Body('user') user: LoginDto) {
    return this.authService.login(user).then((res) => ({ user: res }))
  }

  @Public()
  @Post()
  async signUp(@Body('user') createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto)
    return this.authService.login(createUserDto).then((res) => ({ user: res }))
  }
}
