import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

const gh = await github.get_github()

export const get_user_info = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?GitHub(?:用户|user)(?:信息|info)\s*(.+)?/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_user_info.reg)
      let [, username] = match!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      const user = await gh.get_user()
      let user_info
      if (!username) {
        if (!access_token) {
          throw new Error('喵呜~ 请先进行应用安装然后进行授权安装')
        }
        if (userInfo && userInfo.github_username) {
          username = userInfo.github_username
          user_info = await user.get_user_info({ username })
        } else {
          user_info = await user.get_user_info_by_auth()
        }
      } else {
        user_info = await user.get_user_info({ username })
      }
      username = user_info.data.login
      const contribution = await user.get_user_contribution({ username })
      const img = await Render.render(
        'user/get_user_info',
        {
          platform,
          username: user_info.data.login,
          name: user_info.data.name,
          avatar: user_info.data.avatar_url,
          bio: user_info.data.bio,
          email: user_info.data.email ?? '未公开或未知',
          company: user_info.data.company ?? '未公开或未知',
          blog: user_info.data.blog ?? '未公开或未知',
          followers_count: user_info.data.followers,
          following_count: user_info.data.following,
          contribution_data: contribution.data
        }
      )
      await e.reply(img)
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  }, {
    name: '柠糖码猫:用户:用户信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
