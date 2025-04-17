import { Router } from 'node-karin/express'

import AppRouter from '@/server/router/github/app'
import AuthRouter from '@/server/router/github/auth'
import WebHookRouter from '@/server/router/github/webhook'

const GitHubRouter: Router = Router()

GitHubRouter.use('/auth', AuthRouter)
GitHubRouter.use('/app', AppRouter)
GitHubRouter.use('/webhook', WebHookRouter)

export default GitHubRouter
