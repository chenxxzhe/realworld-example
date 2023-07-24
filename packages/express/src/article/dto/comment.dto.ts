import { MaxLength, ValidateNested, IsInt } from 'class-validator'

class CreateCommentDtoBase {
  @MaxLength(200)
  body: string
}

export class CreateCommentDto {
  @ValidateNested()
  article: CreateCommentDtoBase
}
