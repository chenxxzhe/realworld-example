import { PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'
import { IsUrl, MaxLength } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @MaxLength(1024)
  bio?: string
  @IsUrl()
  @MaxLength(1024)
  image?: string
}
