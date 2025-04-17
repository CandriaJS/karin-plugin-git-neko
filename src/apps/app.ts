import karin, { logger, Message } from 'node-karin'

import { base } from '@/models'
import { Version } from '@/root'

export const app_install = karin.command(
  /^#?((清语)?Git插件|karin-plugin-git-neko)?(GitHub)(应用|Apps)(安装|install)$/i,
  async (e: Message) => {
    try {
      if (e.isGroup) {
        return await e.reply('喵呜~ 请私聊我进行授权安装', { at: true })
      }
      const state_id = await base.get_state_id(e)
      const url = new URL(`${(await base.get_base_url()).remote_url}/github/auth/install`)
      url.searchParams.set('state', state_id)
      await e.reply('请前往以下链接进行安装：\n' + url.toString(), { at: true })
      return true
    } catch (error) {
    /** 一般来说不会发生，但是为了安全起见，还是加上 */
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '清语Git插件:应用安装',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const app_manger = karin.command(
  /^#?((清语)?Git插件|git-neko-plugin)?(GitHub)(应用|Apps)(管理|manger)$/i,
  async (e: Message) => {
    try {
      if (e.isGroup) {
        return await e.reply('喵呜~ 请私聊我进行授权安装', { at: true })
      }
      const state_id = await base.get_state_id(e)
      const url = new URL(`${(await base.get_base_url()).remote_url}/github/auth/install`)
      url.searchParams.set('state', state_id)
      await e.reply('请前往以下链接进行安装：\n' + url.toString(), { at: true })
      return true
    } catch (error) {
    /** 一般来说不会发生，但是为了安全起见，还是加上 */
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '清语Git插件:应用安装',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
