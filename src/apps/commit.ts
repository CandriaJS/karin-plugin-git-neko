import { get_relative_time } from '@candriajs/git-neko-kit'
import MarkdownIt from 'markdown-it'
import { full as emoji } from 'markdown-it-emoji'
import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

const gh = await github.get_github()

export const get_commit_info = karin.command(
  /^#?(?:(?:柠糖码猫)|karin-plugin-git-neko)?(?:GitHub)(?:最新)?(?:提交|commit)(?:信息|info)(?:(?:\s*([\w-]+)(?:[\/\s]+([\w-]+))?)?)?(?:\s+([\w-]+))?/i,
  async (e: Message) => {
    if (!e.isGroup) {
      return await e.reply('喵呜~, 请在群聊中使用此命令')
    }
    try {
      const match = e.msg.match(get_commit_info.reg)
      let [, owner, repo, sha] = match!
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
      const commit_info = await commit.get_commit_info({ owner, repo, sha })
      const visibility = await repo_obj.get_repo_visibility({ owner, repo })
      const md = new MarkdownIt({ html: true })
      md.use(emoji)
      const makdown = md.render(commit_info.data.commit.body ?? '')
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
              visibility,
              author_avatar: commit_info.data.commit.author.avatar_url,
              author_name: commit_info.data.commit.author.login,
              commit_date: await get_relative_time(commit_info.data?.commit?.committer?.date),
              commit_title: commit_info.data.commit.title,
              commit_body: makdown,
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
