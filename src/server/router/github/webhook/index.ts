import { get_relative_time } from '@candriajs/git-neko-kit'
import type { Request, Response, Router } from 'express'
import { common, HTTPStatusCode, logger, segment, SendElement } from 'node-karin'
import express from 'node-karin/express'

import { Config, Render } from '@/common'
import { base, github, utils } from '@/models'

const gh = await github.get_github()

const WebHookRouter: Router = express.Router()

WebHookRouter.post('/', async (req: Request, res: Response) => {
  try {
    if (Config.github.WebhookSecret) {
      const signature = req.headers['x-hub-signature-256'] as string
      if (!signature) {
        return res.status(HTTPStatusCode.NotFound).json({
          code: HTTPStatusCode.NotFound,
          message: '鉴权失败: 缺少signature'
        }) as unknown as void
      }
      const webhook = await gh.get_webhook()
      /** 验证签名 */
      const isValid = await webhook.check_webhook_signature({
        signature,
        payload: JSON.stringify(req.body)
      })
      if (!isValid.data.success) {
        logger.warn('喵呜~, 签名验证失败')
        return res.status(HTTPStatusCode.Unauthorized).json({
          code: HTTPStatusCode.Unauthorized,
          message: '鉴权失败: 签名验证失败'
        }) as unknown as void
      } else {
        logger.debug('喵呜~, 签名验证成功')
      }
    }
    const event = req.headers['x-github-event'] as string
    if (event === 'installation' || event === 'github_app_authorization') {
      return logger.warn('喵呜~, Github App 事件, 跳过推送')
    }

    const action = req.body.action
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

    await Promise.all(webhooks.map(async (webhook) => {
      await common.sleep(500)
      return utils.send_msg('group', String(webhook.botId), String(webhook.groupId), [
        segment.text(`用户 ${req.body.sender.login} 触发了仓库 ${full_name} 事件 ${action ? `${event}/${action}` : event}`)
      ])
    }))

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

    let sendMsg: Array<SendElement>
    switch (event) {
      case 'push':
      {
        branch = req.body.ref.replace('refs/heads/', '').trim()
        const sha = req.body.head_commit.id.slice(0, 7)
        const commit = await gh.get_commit()
        const commit_info = await commit.get_commit_info({ owner, repo, sha })
        const commit_date = await get_relative_time((commit_info.data.commit.committer).date)
        const commit_title = base.render_markdown(commit_info.data.commit.title ?? '')
        const commit_body = base.render_markdown(commit_info.data.commit.body ?? '')
        sendMsg = await Render.render(
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
    await Promise.all(webhooks.map(async (webhook) => {
      await common.sleep(500)
      return utils.send_msg('group', String(webhook.botId), String(webhook.groupId), sendMsg)
    }))
  } catch (error) {
    logger.error(error)
  }
})
export default WebHookRouter
