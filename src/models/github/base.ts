import { ProxyProtocol, ProxyType } from '@candriajs/git-neko-kit'

import { Config } from '@/common'
import { base } from '@/models'

/**
 * 获取Github 实例
 * @param [token] - 用户的token
 * @returns Github 实例, 可选是否带Token的实例
 */
export async function get_github (token?: string | null) {
  try {
    const client = await base.get_client()
    const gh = client.github
    /** 设置代理 */
    if (Config.proxy) {
      const { common, http, https, socks } = Config.proxy
      if (common) {
        gh.setProxy({ type: ProxyType.Common, address: common })
      } else if (http) {
        gh.setProxy({ type: ProxyProtocol.HTTP, address: http })
      } else if (https) {
        gh.setProxy({ type: ProxyProtocol.HTTPS, address: https })
      } else if (socks) {
        gh.setProxy({ type: ProxyProtocol.SOCKS, address: socks })
      }
    }
    if (token) gh.setToken(token)
    return gh
  } catch {
    throw new Error('喵呜~ , 请检查 Github 配置')
  }
}
