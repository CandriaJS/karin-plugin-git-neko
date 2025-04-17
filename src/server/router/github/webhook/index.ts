import bodyParser from 'body-parser'
import { get_relative_time } from 'git-neko-kit'
import MarkdownIt from 'markdown-it'
import { ImageElement, logger } from 'node-karin'
import { Request, Response, Router } from 'node-karin/express'

import { Render } from '@/common'
import { github, utils } from '@/models'

const gh = github.get_github()

const WebHookRouter: Router = Router()

WebHookRouter.use(bodyParser.json())

WebHookRouter.post('/', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string
    if (!signature) {
      return res.status(401).json({
        code: 401,
        message: '签名验证失败'
      })
    }
    const event = req.headers['x-github-event'] as string
    if (event === 'installation') {
      return logger.warn('喵呜~, Github App 事件, 跳过推送')
    }
    const webhook = await gh.get_webhook()

    /** 验证签名 */
    const isValid = await webhook.check_webhook_signature({
      signature,
      payload: JSON.stringify(req.body)
    })
    if (!isValid.data) {
      return logger.warn('喵呜~, 签名验证失败')
    } else {
      logger.debug('喵呜~, 签名验证成功')
    }

    const repository = req.body.repository
    const full_name = repository.full_name
    const visibility = repository.visibility
    const [owner, repo] = full_name.split('/')

    if (req.body.sender.login.includes('[bot]')) {
      return logger.warn('喵呜~, 当前为bot推送, 跳过推送')
    }

    const webhooks = await github.get_all_subscription(owner, repo)
    if (webhooks.length === 0) {
      return logger.warn('喵呜~, 没有找到此仓库的订阅, 跳过推送')
    }

    /** 验证事件类型 */
    if (!webhooks.some(webhook => webhook.event.includes(event))) {
      return logger.warn(`喵呜~, 没有找到匹配 ${event} 事件的订阅, 跳过推送`)
    }

    await Promise.all(webhooks.map(async (webhook) => {
      const token = await utils.get_user_token(String(webhook.user_id))
      gh.setToken(token as string)
    }))

    let img: ImageElement
    switch (event) {
      case 'push':
      {
        const branch = req.body.ref.replace('refs/heads/', '').trim()
        const sha = req.body.head_commit.id.slice(0, 7)
        const commit = await gh.get_commit()
        const commit_info = await commit.get_commit_info({ owner, repo, sha, format: true })
        if (!commit_info.data) {
          return logger.warn('喵呜~, 未找到提交信息')
        }
        const commit_date = await get_relative_time(
          (commit_info.data.commit.committer as { date: string }).date
        )
        const md = new MarkdownIt({ html: true })
        const makdown = md.render(commit_info.data.commit.body as string)
        img = await Render.render(
          'push/index',
          {
            type: 'github',
            owner,
            repo,
            visibility,
            commits: [
              {
                owner,
                repo,
                branch,
                sha,
                visibility,
                author_avatar: commit_info.data.author!.avatar_url,
                author_name: commit_info.data.author!.login,
                commit_date,
                commit_title: commit_info.data.commit.title,
                commit_body: makdown,
                commit_additions: commit_info.data.stats!.additions,
                commit_deletions: commit_info.data.stats!.deletions,
                commit_files_total: commit_info.data.files!.length
              }
            ]
          }
        )
        break
      }
      case 'pull_request':
        logger.warn(`喵呜~, 暂不支持 ${event} 事件`)
        break
      default:
        logger.warn(`喵呜~, 不支持的事件类型: ${event}`)
        return
    }
    /** 未来会扩展为可以私聊发送， 或许(bushi) */
    await Promise.all(webhooks.map(webhook =>
      utils.send_msg('group', String(webhook.bot_id), String(webhook.group_id), img)
    ))
  } catch (error) {
    logger.error(error)
  }
})
export default WebHookRouter
