import { IsEmail, MaxLength, IsUrl, ValidateNested } from 'class-validator'

class LoginUserDtoBase {
  @IsEmail()
  @MaxLength(50)
  email: string
  @MaxLength(50)
  password: string
}

export class LoginUserDto {
  @ValidateNested()
  user: LoginUserDtoBase
}

class CreateUserDtoBase {
  @MaxLength(20)
  username: string
  @IsEmail()
  @MaxLength(50)
  email: string
  @MaxLength(50)
  password: string
}
export class CreateUserDto {
  @ValidateNested()
  user: CreateUserDtoBase
}

class UpdateUserDtoBase extends CreateUserDtoBase {
  @MaxLength(200)
  bio?: string
  @IsUrl()
  @MaxLength(200)
  image?: string
}

export class UpdateUserDto {
  @ValidateNested()
  user: UpdateUserDtoBase
}
