import { db } from '@/models'
import { dbType } from '@/types'
type Model = dbType['github']
/**
 * 获取用户的token
 * @param {string} user_id - 用户ID
 * @returns 用户的token，如果不存在则返回null
 */
export async function get_user_token (user_id: string): Promise<string | null> {
  const user = await db.github.get(user_id)
  return user?.access_token as string | null
}

/**
 * 获取用户的refresh_token
 * @param user_id - 用户ID
 * @returns 用户的refresh_token，如果不存在则返回null
 */
export async function get_user_refresh_token (user_id: string): Promise<string | null> {
  const user = await db.github.get(user_id)
  return user?.refresh_token as string | null
}

/**
 * 更新用户的token
 * @param user_id - 用户ID
 * @param access_token - 新的access_token
 * @param expires_in - access_token的过期时间
 * @param refresh_token - 新的refresh_token
 * @param refresh_token_expires_in - refresh_token的过期时间
 * @returns 无返回值
 */
export async function update_user_token (
  user_id: string,
  access_token: string,
  expires_in: number | null,
  refresh_token: string | null,
  refresh_token_expires_in: number | null
): Promise<[Model, boolean | null]> {
  const user = await db.github.get(user_id)
  if (!user) {
    throw new Error('喵呜~ 该用户不存在, 跳过数据库添加')
  }
  return await db.github.add({
    user_id,
    state_id: user.state_id,
    access_token,
    expires_in,
    refresh_token,
    refresh_token_expires_in
  })
}
