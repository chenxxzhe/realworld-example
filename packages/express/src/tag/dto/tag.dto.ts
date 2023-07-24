import { MaxLength } from 'class-validator'

export class CreateTagDto {
  @MaxLength(20, { each: true })
  tags: string[]
}
