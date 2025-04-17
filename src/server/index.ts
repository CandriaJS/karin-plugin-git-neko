import { app as server, logger } from 'node-karin'

import { base } from '@/models'
import { Version } from '@/root'
import app from '@/server/router'

export const startServer = async (): Promise<boolean> => {
  try {
    const startTime = Date.now()
    logger.info(logger.chalk.bold.yellow(`[${Version.Plugin_AliasName}] 服务启动中...`))
    /** 启动服务 */
    server.use('/git', app)
    logger.info(logger.chalk.bold.green(`=== [${Version.Plugin_AliasName}] 服务启动完成 🚀 ==`))
    logger.info(logger.chalk.rgb(145, 195, 240)(`耗时: ${Date.now() - startTime}ms`))
    logger.info(logger.chalk.rgb(145, 195, 240)(`本地地址: ${(await base.get_base_url()).local_url}`))
    logger.info(logger.chalk.bold.green('==================='))
    return true
  } catch (error) {
    logger.error('启动失败:', (error as Error).message)
    return true
  }
}

export { server }
