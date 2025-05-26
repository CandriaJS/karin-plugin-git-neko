import type { Request, Response, Router } from 'express'
import { logger } from 'node-karin'
import express from 'node-karin/express'

import { base, db, github } from '@/models'

const AuthRouter:Router = express.Router()
const gh = await github.get_github()
const auth = await gh.get_auth()

/** 处理 Github 授权回调 */
AuthRouter.get('/', async (req: Request, res: Response) => {
  const code = req.query.code as string
  if (!code) return res.status(400).json({ code: 400, message: '请传入 code 参数' }) as unknown as void
  let title, text, icon
  title = 'GitHub 授权安装'

  try {
    const stateId = req.query.state as string
    const token = await auth.get_token_by_code({ code })
    const access_token = token.data.access_token
    if (!access_token) throw new Error('获取授权令牌失败')
    const user = await gh.get_user()
    gh.setToken(access_token)
    const username = await user.get_username()
    const expires_in = token.data.expires_in
    const refresh_token = token.data.refresh_token as string
    const refresh_token_expires_in = token.data.refresh_token_expires_in as number
    const userInfo = await base.get_user(stateId)
    const userId = userInfo?.userId
    const botId = userInfo?.botId
    if (!userId || !botId || !username) {
      throw new Error('获取授权用户失败')
    }
    await db.github.add({
      botId,
      userId,
      github_username: username,
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in
    })
    text = '授权成功'
    icon = 'success'
  } catch (error) {
    logger.error('GitHub 授权失败', error)
    text = '授权失败, 请稍后再试或联系管理员'
    icon = 'error'
  }
  return res.render('auth/get_token', { title, text, icon })
})

/** 处理 GitHub 授权安装 */
AuthRouter.get('/install', async (req: Request, res: Response) => {
  const stateId = req.query.state as string
  if (!stateId) return res.status(400).json({ code: 400, message: '请传入 state 参数' }) as unknown as void
  return res.redirect(await auth.create_auth_link(stateId))
})

export default AuthRouter
