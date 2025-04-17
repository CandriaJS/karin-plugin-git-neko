import karin, { logger, Message } from 'node-karin'

import { base, github, utils } from '@/models'
import { Version } from '@/root'

const gh = github.get_github()

export const auth_install = karin.command(
  /^#?((清语)?Git插件|karin-plugin-git-neko)?(GitHub)(Auth|授权)(安装|install)$/i,
  async (e: Message) => {
    try {
      if (e.isGroup) {
        return await e.reply('喵呜~ 请私聊我进行授权安装', { at: true })
      }
      const state_id = await base.get_state_id(e)
      const url = new URL(`${(await base.get_base_url()).local_url}/github/auth/install`)
      url.searchParams.set('state', state_id)
      await e.reply('请前往以下链接进行安装:\n' + url.toString(), { at: true })
      return true
    } catch (error) {
      /** 一般来说不会发生,但是为了安全起见,还是加上 */
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '清语Git插件:授权安装',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const auth_check = karin.command(
  /^#?((清语)?Git插件|karin-plugin-git-neko)?(GitHub)(Auth|授权)(检查|check)$/i,
  async (e: Message) => {
    try {
      const access_token = await utils.get_user_token(e.userId)
      if (!access_token) throw new Error('喵呜~ 请先进行应用安装然后进行授权安装')
      const auth = await gh.get_auth()
      const check = await auth.check_token_status({ access_token })
      let msg = check.data.info
      await e.reply(msg, { at: true })
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '清语Git插件:授权检查',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const auth_refresh = karin.command(
  /^#?((清语)?Git插件|karin-plugin-git-neko)?(GitHub)(Auth|授权)(刷新|refresh)$/i,
  async (e: Message) => {
    try {
      const user_token = await utils.get_user_token(e.userId)
      if (!user_token) throw new Error('喵呜~ 请先进行应用安装然后进行授权安装')
      let refresh_token = await utils.get_user_refresh_token(e.userId)
      let msg
      if (refresh_token) {
        const auth = await gh.get_auth()
        const req = await auth.refresh_token({ refresh_token })
        const access_token = req.data.access_token
        const expires_in = req.data.expires_in
        refresh_token = req.data.refresh_token
        const refresh_token_expires_in = req.data.refresh_token_expires_in
        await utils.update_user_token(e.userId, access_token, expires_in, String(refresh_token), Number(refresh_token_expires_in))
        msg = req.data.info
      } else {
        msg = '喵呜, 无过期时间token, 无需刷新'
      }
      await e.reply(msg, { at: true })
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '清语Git插件:授权刷新',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
