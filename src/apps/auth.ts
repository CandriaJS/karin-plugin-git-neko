import karin, { logger, Message } from 'node-karin'

import { base, github, utils } from '@/models'
import { Version } from '@/root'

const gh = await github.get_github()

export const auth_install = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?(GitHub)(Auth|授权)(安装|install)$/i,
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
      await e.reply('请前往以下链接进行安装:\n' + url.toString(), { at: true })
      return true
    } catch (error) {
      /** 一般来说不会发生,但是为了安全起见,还是加上 */
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '柠糖码猫:授权:安装',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const auth_check = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?(GitHub)(Auth|授权)(检查|check)$/i,
  async (e: Message) => {
    try {
      const botId = e.selfId
      const userId = e.userId
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (!access_token) throw new Error('喵呜~ 请先进行应用安装然后进行授权安装')
      const auth = await gh.get_auth()
      const check = await auth.check_token_status({ access_token })
      let msg = check.data.info
      await e.reply(msg, { reply: true })
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '柠糖码猫:授权:检查',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const auth_refresh = karin.command(
  /^#?((柠糖)?Git插件|karin-plugin-git-neko)?(GitHub)(Auth|授权)(刷新|refresh)$/i,
  async (e: Message) => {
    try {
      const botId = e.selfId
      const userId = e.userId
      const userInfo = await utils.get_user_info(botId, userId)
      if (!userInfo || !userInfo.refresh_token) throw new Error('喵呜~ 请先完成 GitHub 应用安装和授权流程')
      let refresh_token: string | null = userInfo?.refresh_token
      let refresh_token_expires_in = userInfo?.refresh_token_expires_in
      let msg
      if (refresh_token) {
        const auth = await gh.get_auth()
        const req = await auth.refresh_token({ refresh_token })
        const access_token = req.data.access_token
        const expires_in = req.data.expires_in
        refresh_token = req.data.refresh_token
        const refresh_token_expires_in = req.data.refresh_token_expires_in
        const github_username = userInfo.github_username
        await utils.add_user_info({
          botId,
          userId,
          github_username,
          access_token: access_token ?? null,
          expires_in: expires_in ?? null,
          refresh_token: refresh_token ?? null,
          refresh_token_expires_in: refresh_token_expires_in ?? null
        })
        msg = req.data.info
      } else if (refresh_token_expires_in === null) {
        msg = '喵呜, 访问令牌无过期有效期, 无需刷新'
      } else {
        msg = '喵呜, 刷新令牌已过期, 请重新进行授权安装'
      }
      await e.reply(msg, { at: true })
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '柠糖码猫:授权:刷新',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
