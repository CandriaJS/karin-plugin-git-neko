import karin, { GroupMessage, logger, Message } from 'node-karin'

import { github } from '@/models'
import { Version } from '@/root'

export const subscription = karin.command(
  /^#?(?:(?:清语)?Git插件|git-plugin)?(?:GitHub)(?:仓库|repo)(?:订阅|subscription)\s*([\w-]+)[\/\s]+([\w-]+)/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(subscription.reg)
      const [, owner, repo] = match!
      if (!e.isGroup && e.isPrivate) {
        throw new Error('喵呜~, 请在群聊中使用此命令')
      }
      const event = ['push']
      const group_id = 'groupId' in e ? e.groupId : ''
      const user_id = e.userId
      const bot_id = e.selfId
      if (await github.get_subscription(owner, repo, bot_id, user_id, group_id)) {
        throw new Error('喵呜~, 您已经订阅过此仓库')
      }
      try {
        await github.add_subscription(owner, repo, event, bot_id, user_id, group_id)
        await e.reply(`订阅: ${owner}/${repo} 成功`)
      } catch (error) {
        throw new Error('喵呜~, 添加订阅失败, 请尝试重试或联系管理员')
      }
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  }, {
    name: '清语Git插件:组织仓库列表',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
