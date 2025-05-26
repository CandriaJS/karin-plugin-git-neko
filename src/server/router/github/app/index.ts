import type { Request, Response, Router } from 'express'
import express from 'node-karin/express'

import { github } from '@/models'

const AppRouter: Router = express.Router()
const gh = await github.get_github()
const app = await gh.get_app()

/** Github 应用安装路由 */
AppRouter.get('/install', async (req: Request, res: Response) => {
  const stateId = req.query.state as string
  if (!stateId) return res.status(400).json({ code: 400, message: '请传入 state 参数' }) as unknown as void
  res.redirect(await app.create_install_link(stateId))
})

/** Github 应用管理路由 */
AppRouter.get('/manager', async (req: Request, res: Response) => {
  const stateId = req.query.state as string
  if (!stateId) return res.status(400).json({ code: 400, message: '请传入 state 参数' }) as unknown as void
  res.redirect(await app.create_config_install_link(stateId))
})

export default AppRouter
