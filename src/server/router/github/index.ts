import type { Router } from 'express'
import express from 'node-karin/express'

import AppRouter from '@/server/router/github/app'
import AuthRouter from '@/server/router/github/auth'
import WebHookRouter from '@/server/router/github/webhook'

const GitHubRouter: Router = express.Router()

GitHubRouter.use('/auth', AuthRouter)
GitHubRouter.use('/app', AppRouter)
GitHubRouter.use('/webhook', WebHookRouter)

export default GitHubRouter
