import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

export const get_repo_info = karin.command(
  /^#?(?:(?:清语)?Git插件|git-plugin)?(?:GitHub)(?:仓库|repo)(?:信息|info)\s*([\w-]+)[\/\s]+([\w-]+)/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_repo_info.reg)
      if (!match) {
        throw new Error('喵呜~ 请输入要查询的仓库名')
      }
      const [, owner, repo] = match
      const token = await utils.get_user_token(e.userId)
      const gh = github.get_github(token ?? undefined)
      const repo_obj = await gh.get_repo()
      const repo_info = await repo_obj.get_repo_info({ owner, repo })
      const img = await Render.render(
        'repo/get_repo_info',
        {
          type: 'github',
          owner: repo_info.data.owner?.login ?? '未知',
          repo: repo_info.data.name ?? '未知',
          visibility: repo_info.data.private,
          language: repo_info.data.language ?? '未知',
          description: repo_info.data.description ?? '无描述',
          url: repo_info.data.html_url ?? '未知',
          created_at: repo_info.data.created_at ?? '未知',
          updated_at: repo_info.data.updated_at ?? '未知',
          pushed_at: repo_info.data.pushed_at ?? '未知',
          star_count: repo_info.data.stargazers_count ?? '未知',
          fork_count: repo_info.data.forks_count ?? '未知',
          issue_count: repo_info.data.open_issues_count ?? '未知'
        }
      )
      await e.reply(img)
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }
)
export const get_org_repos_list = karin.command(
  /^#?(?:(?:清语)?Git插件|git-plugin)?GitHub(?:组织|org)(?:仓库|repo)(?:列表|list)\s*(.+)?/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_org_repos_list.reg)
      if (!match) throw new Error('喵呜~ 请输入要查询的组织名')
      const [, org] = match
      const token = await utils.get_user_token(e.userId)
      const gh = github.get_github(token ?? undefined)
      const repo = await gh.get_repo()
      const org_repos_list = await repo.get_org_repos_list({ org })
      const repo_list = org_repos_list.data.map(repo => ({
        name: repo.name,
        visibility: repo.private,
        language: repo.language ?? '未知',
        star_count: repo.stargazers_count ?? 0,
        pushed_at: repo.pushed_at ?? '未知'
      }))
      const img = await Render.render(
        'repo/get_org_repos_list',
        {
          type: 'github',
          repo_list
        }
      )
      await e.reply(img)
      return true
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

export const get_user_repos_list = karin.command(
  /^#?(?:(?:清语)?Git插件|git-plugin)?GitHub(?:用户|org)(?:仓库|repo)(?:列表|list)\s*(.*)/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_user_repos_list.reg)
      const username = match?.[1]
      console.log(username)
      const token = await utils.get_user_token(e.userId)
      const gh = github.get_github(token ?? undefined)
      const repo = await gh.get_repo()
      let user_repos_list
      if (!username) {
        if (!token) throw new Error('喵呜~ 请先进行应用安装然后进行授权安装')
        user_repos_list = await repo.get_user_repos_list_by_token({ type: 'owner' })
      } else {
        user_repos_list = await repo.get_user_repos_list({ username, type: 'owner' })
      }
      const repo_list = user_repos_list.data.map(repo => ({
        name: repo.name,
        visibility: repo.private,
        language: repo.language ?? '未知',
        star_count: repo.stargazers_count ?? '未知',
        pushed_at: repo.pushed_at ?? '未知'
      }))
      const img = await Render.render(
        'repo/get_user_repos_list',
        {
          type: 'github',
          repo_list
        }
      )
      await e.reply(img)
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  })
