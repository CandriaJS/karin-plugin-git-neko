import karin, { logger, Message } from 'node-karin'

import { utils } from '@/models'
import { Version } from '@/root'

export const bind_user = karin.command(/^#?(?:(?:柠糖)?码猫插件|karin-plugin-git-neko)?GitHub(?:用户|user)(?:绑定|bind)\s*(.+)$/i, async (e: Message) => {
  try {
    const [, username] = e.msg.match(bind_user.reg)!
    const botId = e.selfId
    const userId = e.userId
    const user_info = await utils.get_user_info(botId, userId)
    if (user_info && user_info.github_username) {
      return await e.reply('喵呜~ 你已经绑定过了喵~')
    }
    await utils.add_user_info({
      botId,
      userId,
      github_username: username,
      access_token: user_info?.access_token ?? null,
      expires_in: user_info?.expires_in ?? null,
      refresh_token: user_info?.refresh_token ?? null,
      refresh_token_expires_in: user_info?.refresh_token_expires_in ?? null
    })
    await e.reply(`喵呜~ 绑定用户${username}成功`)
    return true
  } catch (error) {
    /** 一般来说不会发生，但是为了安全起见，还是加上 */
    logger.error('Github绑定用户出现错误:', error)
    await e.reply(`[${Version.Plugin_AliasName}]: 喵呜~ 未知错误发生，请尝试重试或联系管理员`)
    return true
  }
}, {
  name: '柠糖码猫:绑定:用户绑定',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})

export const bind_repo = karin.command(/^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?GitHub(?:仓库|repo)(?:绑定|bind)\s*([\w-]+)[\/\s]+([\w-]+)$/i, async (e: Message) => {
  try {
    const [, owner, repo] = e.msg.match(bind_repo.reg)!
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    const platform = 'github'
    const botId = e.selfId
    const userId = e.userId
    const groupId = e.groupId
    const repo_info = await utils.get_bind(platform, botId, userId, groupId)
    if (repo_info) {
      await e.reply('喵呜~ 你已经绑定过了喵~')
      return true
    }
    await utils.add_bind(
      platform,
      botId,
      userId,
      groupId,
      owner,
      repo
    )
    await e.reply(`喵呜~ 绑定${owner}/${repo} 成功`)
    return true
  } catch (error) {
    /** 一般来说不会发生，但是为了安全起见，还是加上 */
    logger.error('Github绑定用户出现错误:', error)
    await e.reply(`[${Version.Plugin_AliasName}]: 喵呜~ 未知错误发生，请尝试重试或联系管理员`)
    return true
  }
}, {
  name: '柠糖码猫:绑定:仓库绑定',
  priority: -Infinity,
  event: 'message',
  permission: 'all'
})
