import { MaxLength, ValidateNested, IsInt, IsOptional } from 'class-validator'

// {
//   "article": {
//     "title": "How to train your dragon",
//     "description": "Ever wonder how?",
//     "body": "You have to believe",
//     "tagList": ["reactjs", "angularjs", "dragons"]
//   }
// }
export class QueryArticleDto {
  @MaxLength(20)
  @IsOptional()
  tag?: string
  @MaxLength(50)
  @IsOptional()
  author?: string
  /** 搜索某个用户的收藏文章 */
  @MaxLength(50)
  @IsOptional()
  favorited?: string
  @IsInt()
  @IsOptional()
  limit?: number
  @IsInt()
  @IsOptional()
  offset?: number
}

export class QueryArticleFeedDto {
  @IsInt()
  @IsOptional()
  limit?: number
  @IsInt()
  @IsOptional()
  offset?: number
}

class CreateArticleDtoBase {
  @MaxLength(50)
  title: string
  @MaxLength(200)
  description: string
  @MaxLength(8000)
  body: string
  @MaxLength(20, { each: true })
  tagList?: string[]
}

export class CreateArticleDto {
  @ValidateNested()
  article: CreateArticleDtoBase
}

class UpdateArticleDtoBase {
  @MaxLength(50)
  @IsOptional()
  title?: string
  @MaxLength(200)
  @IsOptional()
  description?: string
  @MaxLength(8000)
  @IsOptional()
  body?: string
  @MaxLength(20, { each: true })
  @IsOptional()
  tagList?: string[]
}

export class UpdateArticleDto {
  @ValidateNested()
  article: UpdateArticleDtoBase
}
