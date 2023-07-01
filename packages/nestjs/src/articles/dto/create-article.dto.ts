import { IsArray, IsNotEmpty, Length, MaxLength } from 'class-validator'

export class CreateArticleDto {
  @Length(1, 255)
  title: string
  @MaxLength(1024)
  description: string
  @IsNotEmpty()
  body: string
  @IsArray()
  tagList: string[]
}
