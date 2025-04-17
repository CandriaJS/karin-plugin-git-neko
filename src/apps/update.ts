import
karin,
{
  AdapterType,
  common,
  config,
  ExecException,
  getPluginInfo,
  logger,
  Message,
  restart,
  restartDirect,
  updateGitPlugin,
  updatePkg
} from 'node-karin'

import { Config } from '@/common'
import { Version } from '@/root'
async function updateNpmPackage (version: string, pluginName: string) {
  const resolve = await updatePkg(pluginName, version)
  return {
    data: resolve.data,
    status: resolve.status
  }
}

async function updateGitRepository (force: boolean, pluginPath: string) {
  const cmd = force
    ? 'git reset --hard HEAD && git pull --rebase'
    : 'git pull'
  const resolve = await updateGitPlugin(pluginPath, cmd)
  return {
    data: resolve.data,
    status: resolve.status
  }
}

export const update = karin.command(/^#?(?:清语表情|clarity-meme)(?:插件)?(?:(强制|预览版))?更新$/i, async (e: Message) => {
  let status: 'ok' | 'failed' | 'error' = 'failed'
  let data: ExecException | string = ''
  const pluginType = getPluginInfo(Version.Plugin_Name)?.type

  if (pluginType === 'npm') {
    const version = e.msg.includes('预览版') ? 'beta' : 'latest'
    const result = await updateNpmPackage(version, Version.Plugin_Name)
    data = result.data
    status = result.status
  } else if (pluginType === 'git') {
    const force = e.msg.includes('强制')
    const result = await updateGitRepository(force, Version.Plugin_Path)
    status = result.status
    data = result.data
  }
  logger.debug(data)
  await e.bot.sendForwardMsg(e.contact, common.makeForward(JSON.stringify(data).slice(1, -1), e.bot.account.selfId, e.bot.account.name), { news: [{ text: `更新${Version.Plugin_Name}` }], prompt: `更新${Version.Plugin_Name}`, summary: Version.Plugin_Name, source: '更新插件' })
  if (status === 'ok') {
    try {
      await e.reply(`\n更新完成，开始重启 本次运行时间：${common.uptime()}`, { at: true })
      await restart(e.selfId, e.contact, e.messageId)
      return true
    } catch (error) {
      await e.reply(`${Version.Plugin_Name}重启失败，请手动重启以应用更新！`)
    }
  }
  return true
}, {
  name: '清语表情:更新',
  priority: -Infinity,
  event: 'message',
  permission: 'master'
})

export const autoUpdatePlugin = Config.other.autoUpdatePlugin && karin.task('自动更新插件', Config.other.autoUpdatePluginCron, async () => {
  let data: ExecException | string = ''
  let status: 'ok' | 'failed' | 'error' = 'failed'
  const botList = karin.getAllBotList()
  const botId = botList[Math.floor(Math.random() * botList.length)].index
  const bot = karin.getBot(botId) as AdapterType
  const master = config.master()[0]
  const contact = karin.contactFriend(master)
  const pluginType = getPluginInfo(Version.Plugin_Name)?.type

  if (pluginType === 'npm') {
    const version = 'latest'
    const result = await updateNpmPackage(version, Version.Plugin_Name)
    data = result.data
    status = result.status
  } else if (pluginType === 'git') {
    const force = false
    const result = await updateGitRepository(force, Version.Plugin_Path)
    status = result.status
    data = result.data
  }
  logger.debug(data)
  await bot.sendForwardMsg(contact, common.makeForward(JSON.stringify(data).slice(1, -1), bot.account.selfId, bot.account.name), { news: [{ text: `更新${Version.Plugin_Name}` }], prompt: `更新${Version.Plugin_Name}`, summary: Version.Plugin_Name, source: '更新插件' })
  if (status === 'ok') {
    try {
      await restartDirect()
      return true
    } catch (error) {
      logger.error(`${Version.Plugin_Name}重启失败，请手动重启以应用更新！`)
    }
  }
  return true
}, {
  name: Version.Plugin_AliasName,
  log: true
}
)
