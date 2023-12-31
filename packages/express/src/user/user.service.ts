import { pool } from '@/db'
import { User } from './entity/user'

const userColumns = ['id', 'email', 'username', 'bio', 'image']
const userColumnsWithPassword = userColumns.concat('password')

export function findBy(
  key: 'id' | 'email' | 'username',
  val: string | number,
  currentUserId?: number,
  withPassword = false,
): Promise<User> {
  if (currentUserId) {
    return pool
      .query(
        'SELECT ??, EXISTS(SELECT id FROM ref_follow WHERE status=1 AND target=user.id AND follower=?) following FROM user WHERE ??=? AND user.deleted=0',
        [
          withPassword ? userColumnsWithPassword : userColumns,
          currentUserId,
          key,
          val,
        ],
      )
      .then((res: any) => res[0]?.[0] as User)
  }
  return pool
    .query('SELECT ?? FROM user WHERE ??=? AND deleted=0', [
      withPassword ? userColumnsWithPassword : userColumns,
      key,
      val,
    ])
    .then((res: any) => res[0]?.[0] as User)
}

export function create(data: User) {
  return pool.query('INSERT INTO user SET ?', [data])
}

export function update(userId: number, data: User) {
  return pool.query('UPDATE user SET ? WHERE id=? AND deleted=0', [
    data,
    userId,
  ])
}

export function remove(userId: number) {
  return pool.query('UPDATE user SET deleted=1 WHERE id=?', [userId])
}

export function follow(targetId: number, followerId: number) {
  return pool.query(
    'INSERT INTO ref_follow SET ? ON DUPLICATE KEY UPDATE status=1',
    [{ target: targetId, follower: followerId, status: 1 }],
  )
}

export function unfollow(targetId: number, followerId: number) {
  return pool.query(
    'UPDATE ref_follow SET status=0 WHERE target=? AND follower=?',
    [targetId, followerId],
  )
}
