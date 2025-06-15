import karin, { logger, Message } from 'node-karin'

import { github, utils } from '@/models'
import { Version } from '@/root'

const gh = await github.get_github()

export const subscription = karin.command(
  /^#?(?:柠糖码猫)?(?:GitHub)(?:仓库|repo)(?:订阅|subscription)\s*([\w-]+)[\/\s]+([\w-]+)(?:\s+([\w-]+))?/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      let [, owner, repo, branch] = e.msg.match(subscription.reg)!
      const platform = 'github'
      const groupId = e.groupId
      const userId = e.userId
      const botId = e.selfId
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) {
        gh.setToken(access_token)
      } else {
        throw new Error('喵呜~, 请先进行应用安装然后进行授权安装')
      }
      let event:string[] = []
      event.push('push')
      const subscription_info = await utils.get_subscription(platform, owner, repo, botId, userId, groupId)
      if (subscription_info) {
        throw new Error(`喵呜~, 此仓库已被用户${subscription_info.userId}订阅`)
      }
      try {
        let target_branch = branch
        if (!target_branch) {
          const repo_obj = await gh.get_repo()
          const default_branch = await repo_obj.get_repo_default_branch({ owner, repo })
          if (!default_branch) {
            throw new Error('喵呜~, 获取仓库默认分支失败')
          }
          target_branch = default_branch
        }
        await utils.add_subscription(platform, owner, repo, target_branch, event, botId, userId, groupId)
        await e.reply(`喵呜~, 订阅: ${owner}/${repo} 成功`)
      } catch (error) {
        throw new Error('喵呜~, 添加订阅失败, 请尝试重试或联系管理员')
      }
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  }, {
    name: '柠糖码猫:订阅:订阅仓库',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
