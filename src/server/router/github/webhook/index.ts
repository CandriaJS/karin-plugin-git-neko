import { get_relative_time } from '@candriajs/git-neko-kit'
import bodyParser from 'body-parser'
import type { Request, Response, Router } from 'express'
import MarkdownIt from 'markdown-it'
import { ImageElement, logger } from 'node-karin'
import express from 'node-karin/express'

import { Render } from '@/common'
import { github, utils } from '@/models'

const gh = await github.get_github()

const WebHookRouter: Router = express.Router()

WebHookRouter.use(bodyParser.json())

WebHookRouter.post('/', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string
    if (!signature) {
      return res.status(403).json({
        code: 401,
        message: '鉴权失败: 缺少signature'
      }) as unknown as void
    }
    const event = req.headers['x-github-event'] as string
    if (event === 'installation' || event === 'github_app_authorization') {
      return logger.warn('喵呜~, Github App 事件, 跳过推送')
    }
    const webhook = await gh.get_webhook()

    /** 验证签名 */
    const isValid = await webhook.check_webhook_signature({
      signature,
      payload: JSON.stringify(req.body)
    })
    if (!isValid.data.success) {
      return logger.warn('喵呜~, 签名验证失败')
    } else {
      logger.debug('喵呜~, 签名验证成功')
    }

    const repository = req.body.repository
    const full_name = repository.full_name
    const visibility = repository.visibility
    const [owner, repo] = full_name.split('/')

    const platform = 'github'
    const webhooks = await utils.get_all_subscription(platform, owner, repo)
    if (webhooks.length === 0) {
      return logger.warn('喵呜~, 没有找到此仓库的订阅, 跳过推送')
    }

    /** 验证事件类型 */
    if (!webhooks.some(webhook => webhook.event.includes(event))) {
      return logger.warn(`喵呜~, 没有找到匹配 ${event} 事件的订阅, 跳过推送`)
    }

    let branch: string
    if (event === 'push') {
      branch = req.body.ref.replace('refs/heads/', '').trim()
      /**  判断是否是机器人推送 */
      if (req.body.sender.login.includes('[bot]')) {
        return logger.warn('喵呜~, 当前为bot推送, 跳过推送')
      }
      /** 验证分支 */
      if (!webhooks.some(webhook => webhook.branch === branch)) {
        return logger.warn(`喵呜~, 没有找到匹配分支 ${branch} 的订阅, 跳过推送`)
      }
    }

    await Promise.all(webhooks.map(async (webhook) => {
      const info = await utils.get_user_info(String(webhook.botId), String(webhook.userId))
      const token = info?.access_token
      if (!token) {
        return logger.warn('喵呜~, 未找到用户的访问令牌')
      }
      gh.setToken(token)
    }))

    let img: ImageElement[]
    switch (event) {
      case 'push':
      {
        branch = req.body.ref.replace('refs/heads/', '').trim()
        const sha = req.body.head_commit.id.slice(0, 7)
        const commit = await gh.get_commit()
        const commit_info = await commit.get_commit_info({ owner, repo, sha, format: true })
        const commit_date = await get_relative_time((commit_info.data.commit.committer).date)
        const md = new MarkdownIt({ html: true })
        const commit_title = md.render(commit_info.data.commit.title as string)
        const commit_body = md.render(commit_info.data.commit.body as string)
        img = await Render.render(
          'commit/get_commit_info',
          {
            platform,
            title: '更新推送',
            commits: [
              {
                owner,
                repo,
                branch,
                sha,
                visibility,
                author_avatar: commit_info.data.commit.author ? commit_info.data.commit.author.avatar_url : null,
                author_name: commit_info.data.commit.author ? commit_info.data.commit.author.login : null,
                commit_date,
                commit_title,
                commit_body,
                commit_additions: commit_info.data.stats.additions,
                commit_deletions: commit_info.data.stats.deletions,
                commit_files_total: commit_info.data.files.length
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
      utils.send_msg('group', String(webhook.botId), String(webhook.groupId), img)
    ))
  } catch (error) {
    logger.error(error)
  }
})
export default WebHookRouter
