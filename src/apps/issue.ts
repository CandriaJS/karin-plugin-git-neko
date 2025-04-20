import { get_relative_time } from 'git-neko-kit'
import MarkdownIt from 'markdown-it'
import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

export const get_issue_info = karin.command(
  /^#?(?:(?:清语)?Git插件|git-neko-plugin)?GitHub(?:议题|issue)(?:信息|info)\s*([\w-]+)[\/\s]+([\w-]+)\s+(\d+)/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_issue_info.reg)
      const [, owner, repo, num] = match!
      const token = await utils.get_user_token(e.userId)
      const gh = github.get_github(token)
      const issue = await gh.get_issue()
      const issue_info = await issue.get_issue_info({ owner, repo, issue_number: Number(num) })
      const repo_info = await ((await gh.get_repo()).get_repo_info({ owner, repo }))
      const visibility = repo_info.data.private
      const star_count = repo_info.data.stargazers_count
      const fork_count = repo_info.data.forks_count
      const md = new MarkdownIt({ html: true })
      const issue_body = md.render(issue_info.data.body as string)
      const img = await Render.render(
        'issue/get_issue_info',
        {
          platform: 'github',
          owner,
          repo,
          visibility,
          star_count,
          fork_count,
          author_name: issue_info.data.user.login,
          author_avatar: issue_info.data.user.avatar_url,
          issue_title: issue_info.data.title,
          issue_state: issue_info.data.state,
          issue_created_at: await get_relative_time(issue_info.data.created_at),
          issue_number: num,
          issue_body
        }
      )
      await e.reply(img)
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  }, {
    name: '清语Git插件:议题信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
