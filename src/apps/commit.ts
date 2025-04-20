import { get_relative_time } from 'git-neko-kit'
import MarkdownIt from 'markdown-it'
import karin, { logger, Message } from 'node-karin'

import { Render } from '@/common'
import { github, utils } from '@/models'
import { Version } from '@/root'

export const get_commit_info = karin.command(
  /^#?(?:(?:清语)?Git插件|git-neko-plugin)?(?:GitHub)(?:最新)?(?:提交|commit)(?:信息|info)\s*([\w-]+)[\/\s]+([\w-]+)(?:\s+([\w-]+))?/i,
  async (e: Message) => {
    try {
      const match = e.msg.match(get_commit_info.reg)
      let [, owner, repo, sha] = match!
      const token = await utils.get_user_token(e.userId)
      const gh = github.get_github(token)
      const commit = await gh.get_commit()
      const repo_obj = await gh.get_repo()
      const commit_info = await commit.get_commit_info({ owner, repo, sha, format: true })
      const visibility = (await repo_obj.get_repo_visibility({ owner, repo }))
      const md = new MarkdownIt({ html: true })
      const makdown = md.render(commit_info.data.commit.body as string)
      const img = await Render.render(
        'commit/get_commit_info',
        {
          platform: 'github',
          title: '提交信息',
          commits: [
            {
              owner,
              repo,
              branch: sha ?? 'main',
              sha: commit_info.data.sha.slice(0, 7),
              visibility,
              author_avatar: commit_info.data?.author?.avatar_url,
              author_name: commit_info.data?.author?.login,
              commit_date: await get_relative_time(commit_info.data?.commit?.committer?.date as string),
              commit_title: commit_info.data.commit.title,
              commit_body: makdown,
              commit_additions: commit_info.data?.stats?.additions,
              commit_deletions: commit_info.data?.stats?.deletions,
              commit_files_total: commit_info.data?.files?.length
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
    name: '清语Git插件:提交信息',
    priority: -Infinity,
    event: 'message',
    permission: 'all'
  })
