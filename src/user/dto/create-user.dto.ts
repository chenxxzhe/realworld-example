import { IsEmail, Length } from 'class-validator'

export class CreateUserDto {
  @Length(1, 50)
  username: string
  @IsEmail()
  @Length(1, 255)
  email: string
  @Length(1, 100)
  password: string
}
