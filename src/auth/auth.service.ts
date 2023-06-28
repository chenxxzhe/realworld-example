import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '@/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOne({ email }, true)
    if (user && user.password === this.userService.encryptPassword(pass)) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(loginInfo: LoginDto) {
    const user = await this.validateUser(loginInfo.email, loginInfo.password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return {
      ...user,
      token: this.signToken({ email: user.email, id: user.id }),
    }
  }

  signToken(user: { email: string; id: number }) {
    return this.jwtService.sign({ email: user.email, sub: user.id })
  }
}
