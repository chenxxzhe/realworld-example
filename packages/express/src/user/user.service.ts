import { pool } from '@/db'

const userColumns = ['id', 'email', 'username', 'bio', 'image']
const userColumnsWithPassword = userColumns.concat('password')

// SELECT u.id, u.name, IF(uf.follower_id IS NOT NULL, 1, 0) AS followed
// FROM user u
// LEFT JOIN (SELECT * FROM user_follows WHERE follower_id = 1) uf ON u.id = uf.followed_id
// WHERE u.id = 2;

// ref_user_user [target, follower]

export function findBy(
  key: 'id' | 'email' | 'username',
  val: string,
  userId?: number,
) {
  if (userId) {
    return pool.execute(
      'SELECT ??, COUNT(ruu.follower) AS Following FROM user LEFT JOIN ref_user_user ruu ON ruu.follower=? WHERE ?=?',
      [userColumnsWithPassword, userId, key, val],
    )
  }
  return pool.execute('SELECT ??, 0 AS following FROM user WHERE ?=?', [
    userColumnsWithPassword,
    key,
    val,
  ])
}

export function create(data: any) {
  return pool.execute('INSERT INTO user SET ?', [data])
}

export function update(userId: number, data: any) {
  return pool.execute('UPDATE user SET ? WHERE id=?', [data, userId])
}

export function remove(userId: number) {
  return pool.execute('DELETE FROM user WHERE id=?', [userId])
}

export function follow(targetId: number, followerId: number) {
  return pool.execute('INSERT INTO ref_user_user SET ?', [
    { target: targetId, follower: followerId },
  ])
}

export function unfollow(targetId: number, followerId: number) {
  return pool.execute(
    'DELETE FROM ref_user_user WHERE target=? AND follower=?',
    [targetId, followerId],
  )
}
