import { Length } from 'class-validator'

export class CreateTagDto {
  @Length(1, 50)
  title: string
}
