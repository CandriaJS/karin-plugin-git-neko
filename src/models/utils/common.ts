import { db } from '@/models'
import { dbType } from '@/types'
type githubModel = dbType['github']
type bindModel = dbType['bind']
type subscriptionModel = dbType['subscription']

/**
 * 获取用户的绑定信息
 * @param botId - 机器人ID
 * @param userId - 用户ID

/**
 * 获取用户信息
 * 后续完善，支持其他平台
 * @param botId
 * @param userId
 * @param [github_username] - 可选的用户名参数
 * @returns 用户信息
 */
export async function get_user_info (
  botId: string,
  userId: string
): Promise<githubModel | null> {
  const data: {
    botId: string;
    userId: string;
  } = {
    botId,
    userId
  }
  return await db.github.get(data)
}

/**
 * 添加用户信息
 * 后续完善，支持其他平台
 * @param botId - 机器人ID
 * @param userId - 用户ID
 * @param github_username - 用户名(github的登录名)
 * @param access_token - 访问令牌
 * @param expires_in - 过期时间
 * @param refresh_token - 刷新令牌
 * @param refresh_token_expires_in - 刷新令牌过期时间
 * @returns 用户的绑定信息
 */

export async function add_user_info ({
  botId,
  userId,
  github_username,
  access_token,
  expires_in,
  refresh_token,
  refresh_token_expires_in
}:{
  botId: string,
  userId: string,
  github_username: string,
  access_token: string | null,
  expires_in: number | null,
  refresh_token: string | null,
  refresh_token_expires_in: number | null
}): Promise<[githubModel, boolean | null]> {
  const data = {
    botId,
    userId,
    github_username,
    access_token,
    expires_in,
    refresh_token,
    refresh_token_expires_in
  }
  return await db.github.add(data)
}

/**
 * 获取当前用户的所在群组绑定信息
 * @param platform - 平台类型, 可选值: 'github'
 * @param botId - 机器人id
 * @param userId - 用户id
 * @param groupId - 群组id
 * @returns
 */
export async function get_bind (
  platform: string,
  botId: string,
  userId: string,
  groupId: string
): Promise<bindModel | null> {
  const data = {
    platform,
    botId,
    userId,
    groupId
  }
  return await db.bind.get(data)
}

/**
 * 添加群组绑定信息
 * @param platform - 平台类型, 可选值: 'github'
 * @param botId - 机器人id
 * @param userId - 用户id
 * @param groupId - 群组id
 * @param oner - 拥有者
 * @param repo - 仓库名称
 * @returns 无返回值
 */
export async function add_bind (
  platform: string,
  botId: string,
  userId: string,
  groupId: string,
  owner: string,
  repo: string
): Promise<[bindModel, boolean | null]> {
  const data = {
    platform,
    botId,
    userId,
    groupId,
    owner,
    repo
  }
  return await db.bind.add(data)
}

/**
 * 添加订阅仓库
 * @param platform - 平台类型, 可选值: 'github'
 * @param repo - 仓库的拥有者
 * @param owner - 仓库名称
 * @param branch - 仓库分支
 * @param event - 订阅事件, 可选值: 'push', 'pull_request'
 * @param botId - 机器人id
 * @param userId - 用户id
 * @param  groupId - 订阅群组id
 */
export async function add_subscription (
  platform: string,
  owner: string,
  repo: string,
  branch: string,
  event: string[],
  botId: string,
  userId: string,
  groupId: string
): Promise<[subscriptionModel, boolean | null]> {
  event = Array.isArray(event) ? event : [event]
  const data = {
    platform,
    owner,
    repo,
    branch,
    event,
    botId,
    userId,
    groupId
  }
  return await db.subscription.add(data)
}
/**
 * 获取订阅信息
 * @param platform - 平台类型, 可选值: 'github'
 * @param repo - 仓库的拥有者
 * @param owner - 仓库名称
 * @param botId - 机器人id
 * @param groupId - 订阅群组id
 * @returns 订阅信息列表
 */
export async function get_subscription (
  platform: string,
  owner: string,
  repo: string,
  botId: string,
  userId: string,
  groupId: string
): Promise<subscriptionModel | null> {
  const data = {
    platform,
    owner,
    repo,
    botId,
    userId,
    groupId
  }
  return await db.subscription.get(data)
}

/**
 * 获取订阅信息
 * @param platform - 平台类型, 可选值: 'github'
 * @param repo - 仓库的拥有者
 * @param owner - 仓库名称
 * @returns 订阅信息列表
 */
export async function get_all_subscription (
  platform: string,
  owner: string,
  repo: string
): Promise<subscriptionModel[]> {
  const data = {
    platform,
    owner,
    repo
  }
  return await db.subscription.get_all(data)
}
