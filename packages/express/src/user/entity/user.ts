export class User {
  id: number
  username: string
  email: string
  password?: string
  bio?: string
  image?: string
  /** JWT */
  token?: string
  following?: boolean
}
