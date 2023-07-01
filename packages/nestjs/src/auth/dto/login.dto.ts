import { IsEmail, Length } from 'class-validator'

export class LoginDto {
  @IsEmail()
  @Length(1, 255)
  email: string
  @Length(1, 100)
  password: string
}
