import { create_state_id } from 'git-neko-kit'
import { Message, redis } from 'node-karin'

import { Version } from '@/root'

/**
 * 获取用户的状态标识符
 * @param {object} e - 事件对象，包含用户的 user_id 属性
 * @returns {Promise<string>} 生成的状态标识符
 */
export async function get_state_id (e: Message) {
  const existing_state_id = await redis.get(`karin:${Version.Plugin_Name}:github:user_id:${e.userId}`)

  if (existing_state_id) {
    await redis.del(`karin:${Version.Plugin_Name}:github:user_id:${e.userId}`)
    await redis.del(`karin:${Version.Plugin_Name}:github:state_id:${existing_state_id}`)
  }

  const state_id = await create_state_id()
  await redis.set(`karin:${Version.Plugin_Name}:github:user_id:${e.userId}`, state_id, { EX: 600 })
  await redis.set(`karin:${Version.Plugin_Name}:github:state_id:${state_id}`, e.userId, { EX: 600 })
  return state_id
}

/**
 * 通过state_id查询对应的用户ID
 * @param  state_id - 要查询的状态标识符
 * @returns 对应的用户ID，未找到返回null
 */
export async function get_user_id_by_state_id (state_id: string): Promise<string | null> {
  const user_id = await redis.get(`karin:${Version.Plugin_Name}:github:state_id:${state_id}`)
  return user_id ?? null
}
