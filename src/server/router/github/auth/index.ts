import { logger } from 'node-karin'
import { Request, Response, Router } from 'node-karin/express'

import { base, db, github } from '@/models'

const AuthRouter:Router = Router()
const gh = github.get_github()
const auth = await gh.get_auth()

/** 处理 Github 授权回调 */
AuthRouter.get('/', async (req: Request, res: Response) => {
  if (!req.query.code) return res.status(400).json({ code: 400, message: '请传入 code 参数' })
  let title, text, icon
  title = 'GitHub 授权安装'

  try {
    const code = req.query.code as string
    const state_id = req.query.state as string
    const token = await auth.get_token_by_code({ code })
    const access_token = token.data.access_token
    const expires_in = token.data.expires_in
    const refresh_token = token.data.refresh_token as string
    const refresh_token_expires_in = token.data.refresh_token_expires_in as number
    const user_id = await base.get_user_id_by_state_id(state_id) as string
    await db.github.add({
      user_id,
      state_id,
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
  if (!req.query.state) return res.status(400).json({ code: 400, message: '请传入 state 参数' })
  const state_id = req.query.state as string
  return res.redirect(await auth.create_auth_link(state_id))
})

export default AuthRouter
