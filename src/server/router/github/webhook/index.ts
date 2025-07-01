import { get_relative_time, render_markdown } from '@candriajs/git-neko-kit'
import type { Request, Response, Router } from 'express'
import { common, HTTPStatusCode, logger, segment, SendElement } from 'node-karin'
import express from 'node-karin/express'

import { Config, Render } from '@/common'
import { github, utils } from '@/models'

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
    const ignoreEvents = [
      'installation',
      'github_app_authorization'
    ]
    if (ignoreEvents.includes(event)) {
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
        break
      }
      case 'issues':
        {
          const issue_info = req.body.issue
          sendMsg = await Render.render(
            'issue/get_issue_info',
            {
              platform,
              owner,
              repo,
              author_name: issue_info.user?.login,
              author_avatar: issue_info.user?.avatar_url,
              issue_number: issue_info.number,
              issue_state: issue_info.state,
              issue_title: await render_markdown(issue_info.title),
              issue_body: await render_markdown(issue_info.body ?? ''),
              issue_created_at: await get_relative_time(issue_info.created_at)
            }
          )
        }
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
