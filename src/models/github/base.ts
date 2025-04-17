import { github } from 'git-neko-kit'

import { Config } from '@/common'
import { db } from '@/models'
import { dbType } from '@/types'
type Model = dbType['subscription']

/**
 * 获取Github 实例
 * @param {string} [token] - 用户的token
 * @returns Github 实例, 可选是否带Token的实例
 */
export function get_github (token?: string): github.Base {
  if (
    !(Config.github.APPID ||
      Config.github.PrivateKey ||
      Config.github.ClientID ||
      Config.github.ClientSecret ||
      Config.github.WebhookSecret)
  ) {
    throw new Error('喵呜~ , 请检查 Github 配置')
  }
  try {
    const gh = new github.Base({
      APP_ID: Config.github.APPID,
      Private_Key: Config.github.PrivateKey,
      Client_ID: Config.github.ClientID,
      Client_Secret: Config.github.ClientSecret,
      WebHook_Secret: Config.github.WebhookSecret
    })
    /** 设置代理 */
    if (Config.proxy) {
      const { common, http, https, socks } = Config.proxy
      if (common) {
        gh.setProxy({ type: 'common', address: common })
      } else if (http) {
        gh.setProxy({ type: 'http', address: http })
      } else if (https) {
        gh.setProxy({ type: 'https', address: https })
      } else if (socks) {
        gh.setProxy({ type: 'socks', address: socks })
      }
    }
    if (token) gh.setToken(token)
    return gh
  } catch {
    throw new Error('喵呜~ , 请检查 Github 配置')
  }
}

/**
 * 添加订阅仓库
 * @param repo - 仓库的拥有者
 * @param owner - 仓库名称
 * @param event - 订阅事件, 可选值: 'push', 'pull_request'
 * @param user_id - 用户id
 * @param group_id - 订阅群组id
 */
export async function add_subscription (
  owner: string,
  repo: string,
  event: string[],
  bot_id: string,
  user_id: string,
  group_id:string) {
  return await db.subscription.add(
    {
      platform: 'github',
      owner,
      repo,
      event,
      bot_id,
      user_id,
      group_id
    }
  )
}
/**
 * 获取订阅信息
 * @param repo - 仓库的拥有者
 * @param owner - 仓库名称
 * @param {string} user_id - 用户id
 * @param {string} group_id - 订阅群组id
 * @returns 订阅信息
 */
export async function get_subscription (
  owner: string,
  repo: string,
  bot_id: string,
  user_id: string,
  group_id: string):
  Promise<Model | null> {
  return await db.subscription.get({
    platform: 'github',
    owner,
    repo,
    bot_id,
    user_id,
    group_id
  })
}

/**
 * 获取订阅信息
 * @param repo - 仓库的拥有者
 * @param owner - 仓库名称
 * @returns 订阅信息列表
 */
export async function get_all_subscription (
  owner: string,
  repo: string): Promise<Model[]> {
  return await db.subscription.get_all({
    platform: 'github',
    owner,
    repo
  })
}
