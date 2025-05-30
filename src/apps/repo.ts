import { get_langage_color } from '@candriajs/git-neko-kit'
import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'
const gh = await github.get_github()

export const get_repo_info = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?(?:GitHub)(?:仓库|repo)(?:信息|info)\s*([\w-]+)[\/\s]+([\w-]+)/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      const match = e.msg.match(get_repo_info.reg)
      let [, owner, repo] = match!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const groupId = e.groupId
      const bind_info = await utils.get_bind(platform, botId, userId, groupId)
      if (!(owner || repo) && bind_info) {
        if (!bind_info.owner || !bind_info.repo) {
          throw new Error('喵呜~ ,请先使用 #GitHub仓库绑定 命令绑定仓库')
        }
        owner = bind_info.owner
        repo = bind_info.repo
      }
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      const repo_obj = await gh.get_repo()
      const repo_info = await repo_obj.get_repo_info({ owner, repo })
      const img = await Render.render(
        'repo/get_repo_info',
        {
          platform,
          owner: repo_info.data.owner?.login ?? '未知',
          repo: repo_info.data.name ?? '未知',
          visibility: repo_info.data.private,
          language: repo_info.data.language ?? '未知',
          language_color: repo_info.data.language ? get_langage_color(repo_info.data.language.toLowerCase()) : '#ededed',
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
  }, {
    name: '柠糖码猫:仓库:仓库信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const get_org_repos_list = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?GitHub(?:组织|org)(?:仓库|repo)(?:列表|list)\s*(.+)/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_org_repos_list.reg)
      const [, org] = match!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      const repo = await gh.get_repo()
      const org_repos_list = await repo.get_org_repos_list({ org })
      const repo_list = org_repos_list.data.map(repo => ({
        name: repo.name,
        visibility: repo.private,
        language: repo.language ?? '未知',
        language_color: repo.language ? get_langage_color(repo.language.toLowerCase()) : '#ededed',
        star_count: repo.stargazers_count ?? 0,
        pushed_at: repo.pushed_at ?? '未知'
      }))
      const img = await Render.render(
        'repo/get_org_repos_list',
        {
          platform,
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
    name: '柠糖码猫:仓库:组织仓库列表',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })

export const get_user_repos_list = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?GitHub(?:用户|org)(?:仓库|repo)(?:列表|list)\s*(.+)?/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_user_repos_list.reg)
      const [, username] = match!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const userInfo = await utils.get_user_info(botId, userId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      const repo = await gh.get_repo()
      let repo_list
      if (!username) {
        if (!userInfo) {
          throw new Error('喵呜~ 请先进行应用安装然后进行授权安装或使用[#github用户绑定xxx]来绑定用户使用')
        }

        if (userInfo.access_token) {
          repo_list = await repo.get_user_repos_list_by_token({ type: 'owner' })
        } else if (userInfo.github_username) {
          repo_list = await repo.get_user_repos_list({ username: userInfo.github_username, type: 'owner' })
        } else {
          throw new Error('喵呜~ 需要授权或登录才能获取仓库列表')
        }
      } else {
        repo_list = await repo.get_user_repos_list({ username, type: 'owner' })
      }
      repo_list = repo_list.data.map(repo => ({
        name: repo.name,
        visibility: repo.private,
        language: repo.language ?? '未知',
        language_color: repo.language ? get_langage_color(repo.language.toLowerCase()) : '#ededed',
        star_count: repo.stargazers_count ?? '未知',
        created_at: repo.created_at ?? '未知',
        updated_at: repo.updated_at ?? '未知',
        pushed_at: repo.pushed_at ?? '未知'
      }))
      const img = await Render.render(
        'repo/get_user_repos_list',
        {
          platform,
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
    name: '柠糖码猫:仓库:用户仓库列表',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
export const add_collaborator = karin.command(
  /^#?(?:(?:柠糖)?码猫插件|karin-plugin-git-neko)?GitHub(?:仓库|repo)(?:((邀请|invit)|(添加|add)))(?:\s*([\w-]+))?(?:[\/\s]+([\w-]+))?(?:\s*([\w-]+))?(?:\s*([\w-]+))?/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      let [, owner, repo, username, permission] = e.msg.match(add_collaborator.reg)!
      const platform = 'github'
      const userId = e.userId
      const botId = e.selfId
      const groupId = e.groupId
      const getquotedUser = async (e: Message): Promise<string | null> => {
        let source = null
        let MsgId: string | null = null

        if (e.replyId) {
          MsgId = (await e.bot.getMsg(e.contact, e.replyId)).messageId ?? null
        } else {
          MsgId = e.elements.find((m) => m.type === 'reply')?.messageId ?? null
        }
        if (MsgId) {
          source = (await e.bot.getHistoryMsg(e.contact, MsgId, 2))?.[0] ?? null
        }
        if (source) {
          const sourceArray = Array.isArray(source) ? source : [source]
          return sourceArray[0].sender.userId.toString()
        }
        return null
      }

      const target_id = e.at[0] ?? await getquotedUser(e)
      const userInfo = await utils.get_user_info(botId, userId)
      const bind_info = await utils.get_bind(platform, botId, userId, groupId)
      const access_token = userInfo?.access_token
      if (access_token) gh.setToken(access_token)
      if (!owner || !repo || !username) {
        if (!bind_info) {
          throw new Error('喵呜~ ,请先使用 #GitHub仓库绑定 命令绑定仓库')
        }
        if (!target_id) {
          throw new Error('喵呜~, 请艾特要邀请的用户')
        }
        const target_user_info = await utils.get_user_info(botId, target_id)
        if (!target_user_info || !target_user_info.github_username) {
          throw new Error('喵呜~, 该用户未绑定用户名')
        }
        owner = bind_info.owner
        repo = bind_info.repo
        username = target_user_info.github_username
      }
      permission = permission ?? 'pull'
      const repo_obj = await gh.get_repo()
      const collaborator_info = await repo_obj.add_collaborator({ owner, repo, username, permission })
      const user = await gh.get_user()
      const user_info = await user.get_user_info({ username })
      const nickname = user_info.data.name ?? '未知'
      const repo_url = collaborator_info.data.html_url.replace(/\/$/, '')
      const msg = `喵呜~ 已成功邀请 ${username}\n邀请信息:\n用户名: ${user_info.data.login}\n昵称: ${nickname}\n邀请地址: ${repo_url}/invitations\n仓库地址: ${repo_url}`
      await e.reply(msg)
      return true
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
      return true
    }
  }, {
    name: '柠糖码猫:仓库:邀请协作者',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
