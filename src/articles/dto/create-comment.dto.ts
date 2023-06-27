import { Length } from 'class-validator'

export class CreateCommentDto {
  @Length(1, 200)
  body: string
}
