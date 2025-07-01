import { get_relative_time, render_markdown } from '@candriajs/git-neko-kit'
import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { base, github, utils } from '@/models'
import { Version } from '@/root'

const gh = await github.get_github()

export const get_commit_info = karin.command(
  /^#?(?:柠糖码猫)?(?:GitHub)(?:最新)?(?:提交|commit)(?:信息|info)(?:(?:\s*([\w-]+)(?:[\/\s]+([\w-]+))?)?)?(?:\s+([\w-]+))?/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      let [, owner, repo, sha] = e.msg.match(get_commit_info.reg)!
      const platform = 'github'
      const botId = e.selfId
      const userId = e.userId
      const groupId = e.groupId
      const bind_info = await utils.get_bind(platform, botId, userId, groupId)
      if (bind_info) {
        if (owner && /^[\da-f]{7,40}$/i.test(owner)) {
          sha = owner
          owner = ''
        }
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
      const commit = await gh.get_commit()
      const repo_obj = await gh.get_repo()
      if (!sha) {
        const default_branch = await repo_obj.get_repo_default_branch({ owner, repo })
        if (!default_branch) throw new Error('喵呜~ , 获取仓库默认分支失败, 请手动指定')
        sha = default_branch
      }
      const commit_info = await commit.get_commit_info({ owner, repo, sha })
      const img = await Render.render(
        'commit/get_commit_info',
        {
          platform,
          title: '提交信息',
          commits: [
            {
              owner,
              repo,
              branch: sha,
              sha: commit_info.data.sha.slice(0, 7),
              author_avatar: commit_info.data.commit.author.avatar_url,
              author_name: commit_info.data.commit.author.login,
              committer_avatar: commit_info.data.commit.committer.avatar_url,
              committer_name: commit_info.data.commit.committer.login,
              commit_date: await get_relative_time(commit_info.data.commit.committer.date),
              commit_title: await render_markdown(commit_info.data.commit.title ?? ''),
              commit_body: await render_markdown(commit_info.data.commit.body ?? ''),
              commit_additions: commit_info.data.stats.additions,
              commit_deletions: commit_info.data.stats.deletions,
              commit_files_total: commit_info.data.files.length
            }
          ]
        }
      )
      await e.reply(img)
    } catch (error) {
      logger.error(error)
      await e.reply(`[${Version.Plugin_AliasName}]: ${(error as Error).message}`)
    }
  }, {
    name: '柠糖码猫:提交:提交信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
