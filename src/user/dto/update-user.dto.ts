import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'
import { IsOptional, IsUrl, MaxLength } from 'class-validator'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @MaxLength(1024)
  bio?: string
  @IsOptional()
  @IsUrl()
  @MaxLength(1024)
  image?: string
}
