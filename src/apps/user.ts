import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

export const get_user_info = karin.command(
  /^#?(?:(?:清语)?Git插件|git-plugin)?GitHub(?:用户|user)(?:信息|info)\s*(.*)/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_user_info.reg)
      if (!match) throw new Error('喵呜~ 请输入要查询的用户名')
      let [, name] = match
      const token = await utils.get_user_token(e.userId) as string
      const gh = github.get_github(token)
      const user = await gh.get_user()
      let user_info
      if (!name) {
        if (!token) throw new Error('喵呜~ 请先进行应用安装然后进行授权安装')
        user_info = await user.get_user_info_by_token()
      } else {
        user_info = await user.get_user_info({ username: name })
      }
      name = user_info.data.login
      const contribution = await user.get_user_contribution({ username: name })
      const img = await Render.render(
        'user/get_user_info',
        {
          type: 'github',
          username: user_info.data.login,
          name: user_info.data.name,
          avatar: user_info.data.avatar_url,
          bio: user_info.data.bio,
          email: user_info.data.email ?? '未公开或未知',
          location: user_info.data.location ?? '未公开或未知',
          company: user_info.data.company ?? '未公开或未知',
          blog: user_info.data.blog,
          created_at: user_info.data.created_at,
          updated_at: user_info.data.updated_at,
          repos_count: user_info.data.public_repos,
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
    name: '清语Git插件:用户信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
