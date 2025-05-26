import { get_relative_time } from '@candriajs/git-neko-kit'
import MarkdownIt from 'markdown-it'
import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

const gh = await github.get_github()

export const get_issue_info = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?GitHub(?:议题|issue)(?:信息|info)(?:\s*([\w-]+)(?:[\/\s]+([\w-]+))?)?\s+(\d+)/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      const match = e.msg.match(get_issue_info.reg)
      let [, owner, repo, issue_number] = match!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const groupId = e.groupId
      const bind_info = await utils.get_bind(platform, botId, userId, groupId)
      if (bind_info) {
        if (!owner || !repo) {
          if (!bind_info.owner || !bind_info.repo) {
            throw new Error('喵呜~ ,请先使用 #GitHub仓库绑定 命令绑定仓库')
          }
          owner = bind_info.owner
          repo = bind_info.repo
        }
      }
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      const issue = await gh.get_issue()
      const issue_info = await issue.get_issue_info({ owner, repo, issue_number: Number(issue_number) })
      const repo_info = await ((await gh.get_repo()).get_repo_info({ owner, repo }))
      const visibility = repo_info.data.private
      const star_count = repo_info.data.stargazers_count
      const fork_count = repo_info.data.forks_count
      const md = new MarkdownIt({ html: true })
      let issue_body = null
      if (issue_info && issue_info.data.body) {
        issue_body = md.render(issue_info.data.body)
      }
      const img = await Render.render(
        'issue/get_issue_info',
        {
          platform,
          owner,
          repo,
          visibility,
          star_count,
          fork_count,
          author_name: issue_info.data.user?.login,
          author_avatar: issue_info.data.user?.avatar_url,
          issue_title: issue_info.data.title,
          issue_state: issue_info.data.state,
          issue_created_at: await get_relative_time(issue_info.data.created_at),
          issue_number,
          issue_body
        }
      )
      await e.reply(img)
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  }, {
    name: '柠糖码猫:议题:议题信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const create_issue = karin.command(
  /^#?(?:(?:柠糖)?Git插件|karin-plugin-git-neko)?GitHub(?:议题|issue)(?:创建|create)\s*([\w-]+)[\/\s]+([\w-]+)\s+(.+)/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      const match = e.msg.match(create_issue.reg)
      let [, owner, repo, title] = match!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const groupId = e.groupId
      const bind_info = await utils.get_bind(platform, botId, userId, groupId)
      if (bind_info) {
        if (!owner || !repo) {
          if (!bind_info.owner || !bind_info.repo) {
            throw new Error('喵呜~ ,请先使用 #GitHub仓库绑定 命令绑定仓库')
          }
          owner = bind_info.owner
          repo = bind_info.repo
        }
      }
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      await e.reply('请输入Issue内容, 输入"无"表示不输入内容')
      const context = await karin.ctx(e)
      const issue = await gh.get_issue()
      let body: string | null = context.msg.trim()
      if (context.msg.trim() === '无') {
        body = null
      }
      const issue_info = await issue.create_issue({ owner, repo, title, body })
      await e.reply(`[${Version.Plugin_AliasName}]: Issue创建成功, Issue链接: ${issue_info.data.html_url}`)
    } catch (error) {
    }
  }, {
    name: '柠糖码猫:议题:议题创建',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
