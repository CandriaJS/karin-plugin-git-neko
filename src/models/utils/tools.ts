import karin, { AdapterType, logger, SendElement } from 'node-karin'

/**
 * 发送消息
 * @param type - 消息类型，可选值为 'group' 或 'private'
 * @param botId - 机器人的 ID
 * @param id - 消息接收者的 ID，当 type 为 'group' 时为群聊 ID，当 type 为 'private' 时为用户 ID
 * @param msg - 要发送的消息内容，可以是任何类型的消息，如segment.imag等
 * @returns 发送消息的结果
 */
export async function send_msg (type: string, botId: string, id: string, msg: Array<SendElement>) {
  try {
    const bot = karin.getBot(botId) as AdapterType
    if (type === 'group') {
      const contact = karin.contactGroup(id)
      return await bot.sendMsg(contact, msg)
    } else if (type === 'private') {
      const contact = karin.contactFriend(id)
      return await bot.sendMsg(contact, msg)
    } else {
      throw new Error('喵呜~, 未知的消息类型')
    }
  } catch (err) {
    logger.error(`喵呜~ 向${type === 'group' ? '群组' : '私聊'} ${id} 发送消息时出错：`, err)
  }
}
