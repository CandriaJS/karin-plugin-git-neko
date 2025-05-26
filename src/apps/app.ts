import karin, { logger, Message } from 'node-karin'

import { base } from '@/models'
import { Version } from '@/root'

export const app_install = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?(GitHub)(应用|Apps)(安装|install)$/i,
  async (e: Message) => {
    try {
      if (e.isGroup) {
        return await e.reply('喵呜~ 请私聊我进行授权安装', { at: true })
      }
      const botId = e.selfId
      const userId = e.userId
      const stateId = await base.get_stateId(botId, userId)
      const url = new URL(`${await base.get_base_url()}/github/auth/install`)
      url.searchParams.set('state', stateId)
      await e.reply('请前往以下链接进行安装：\n' + url.toString(), { at: true })
      return true
    } catch (error) {
    /** 一般来说不会发生，但是为了安全起见，还是加上 */
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '柠糖码猫:应用:安装',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const app_manger = karin.command(
  /^#?((柠糖)?Git插件|karin-plugin-git-neko)?(GitHub)(应用|Apps)(管理|manger)$/i,
  async (e: Message) => {
    try {
      if (e.isGroup) {
        return await e.reply('喵呜~ 请私聊我进行授权安装', { at: true })
      }
      const botId = e.selfId
      const userId = e.userId
      const stateId = await base.get_stateId(botId, userId)
      const url = new URL(`${await base.get_base_url()}/github/auth/install`)
      url.searchParams.set('state', stateId)
      await e.reply('请前往以下链接进行安装：\n' + url.toString(), { at: true })
      return true
    } catch (error) {
    /** 一般来说不会发生，但是为了安全起见，还是加上 */
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '柠糖码猫:应用:管理',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
