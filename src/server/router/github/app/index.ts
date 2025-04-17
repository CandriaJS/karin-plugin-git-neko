import { Request, Response, Router } from 'node-karin/express'

import { github } from '@/models'

const AppRouter:Router = Router()
const gh = github.get_github()
const app = await gh.get_app()

/** * Github 应用安装路由 */
AppRouter.get('/install', async (req: Request, res: Response) => {
  if (!req.query.state) return res.status(400).json({ code: 400, message: '请传入 state 参数' })
  const state_id = req.query.state
  res.redirect((await app.create_install_link(state_id as string)))
})

/** Github 应用管理路由 */
AppRouter.get('/manger', async (req, res) => {
  if (!req.query.state) return res.status(400).json({ code: 400, message: '请传入 state 参数' })
  const state_id = req.query.state
  res.redirect(await app.create_config_install_link(state_id as string))
})

export default AppRouter
