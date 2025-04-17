import artTemplate from 'express-art-template'
import { logger } from 'node-karin'
import express, { Application } from 'node-karin/express'
import path from 'path'

import { Version } from '@/root'
import BaseRouter from '@/server/router/base'
import GitHubRouter from '@/server/router/github'

const app: Application = express()

app.use((req, res, next) => {
  const startTime = Date.now()
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    const url = req.url
    const method = req.method
    const statusCode = res.statusCode
    const forwardedFor = req.headers['x-forwarded-for']
    const firstIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
    const clientIP = (
      (firstIp?.split(',')[0].trim() ??
       req.headers['x-real-ip'] ??
       req.socket.remoteAddress)
    )?.toString().replace(/^::ffff:/, '')
    logger.info(`[${Version.Plugin_Name}][${method}] ${url} (状态码: ${statusCode}, 耗时: ${responseTime}ms, 客户端IP: ${clientIP})`)
  })
  next()
})

app.engine('html', artTemplate)
app.set('view engine', 'html')
app.set('views', `${Version.Plugin_Path}/resources`)
app.locals.gitLayout = `${Version.Plugin_Path}/resources/common/layout/git.html`.replace(/\\/g, '/')

/** 静态资源 */
app.use('/common', express.static(path.join(Version.Plugin_Path, 'resources/common')))

app.use('/', BaseRouter)
app.use('/github', GitHubRouter)

export default app
