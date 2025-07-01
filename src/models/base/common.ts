import Client, { create_state_id } from '@candriajs/git-neko-kit'
import { redis } from 'node-karin'

import { Config } from '@/common'
import { Version } from '@/root'

/**
 * 获取用户的状态标识符
 * @param botId 机器人ID
 * @param userId 用户ID
 * @returns 生成的状态标识符
 */
export async function get_stateId (botId: string, userId: string) {
  const redis_key_prefix = `karin:${Version.Plugin_Name}:github`
  const existing_stateId = await redis.get(`${redis_key_prefix}:user:${userId}`)

  if (existing_stateId) {
    await redis.del(`${redis_key_prefix}:user:${userId}`)
    await redis.del(`${redis_key_prefix}:stateId:${existing_stateId}`)
  }

  const stateId = await create_state_id()
  const userData = JSON.stringify({ botId, userId })
  await redis.set(`${redis_key_prefix}:user:${userId}`, stateId, { EX: 600 })
  await redis.set(`${redis_key_prefix}:stateId:${stateId}`, userData, { EX: 600 })
  return stateId
}

/**
 * 通过stateId查询对应的用户ID
 * @param  stateId - 要查询的状态标识符
 * @returns 对应的用户ID，未找到返回null
 */
export async function get_user (stateId: string): Promise<{ botId: string, userId: string } | null> {
  const redis_key = `karin:${Version.Plugin_Name}:github:stateId:${stateId}`
  const userData = await redis.get(redis_key)
  if (!userData) return null
  try {
    return JSON.parse(userData)
  } catch (e) {
    return null
  }
}

/**
 * 获取一个客户户端实例
 * @returns 客户户端实例
 */
export async function get_client () {
  try {
    if (
      (!(Config.github.PrivateKey &&
        Config.github.ClientID &&
        Config.github.ClientSecret) &&
        !Config.github.access_token)
    ) {
      throw new Error('喵呜~ , 请检查 Github 配置')
    }
    const options: { github: Record<string, any> } = { github: {} }
    if (Config.github.access_token) {
      options.github.access_token = Config.github.access_token
    } else if (
      Config.github.PrivateKey &&
      Config.github.ClientID &&
      Config.github.ClientSecret
    ) {
      options.github.Private_Key = Config.github.PrivateKey
      options.github.Client_ID = Config.github.ClientID
      options.github.Client_Secret = Config.github.ClientSecret
    }
    if (Config.github.WebhookSecret) {
      options.github.WebHook_Secret = Config.github.WebhookSecret
    }
    options.github.format = true
    return Promise.resolve(new Client(options))
  } catch {
    throw new Error('喵呜~, 请检查 客户端 配置')
  }
}
