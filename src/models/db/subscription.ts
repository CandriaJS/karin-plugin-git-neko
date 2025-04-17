import { DataTypes, sequelize } from '@/models/db/base'
import { dbType } from '@/types'
type Model = dbType['subscription']

export const table = sequelize.define('subscription', {
  /**
   * 主键Id
   * @type {Number}
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键'
  },
  /**
   * 订阅的平台类型，如：github、gitee、gitlab等
   * @type {String}
   */
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '平台类型'
  },
  /**
   * 仓库的拥有者
   * @type {String}
   */
  owner: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '仓库拥有者'
  },
  repo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '仓库名称'
  },
  /**
   * 订阅仓库的事件类型，如：push、release等
   * @type {String[]}
   */
  event: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '订阅类型'
  },
  /**
   * BOT ID，订阅者的机器人Id
   * @type {String}
   */
  bot_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '机器人Id'
  },
  /**
   * 用户Id，订阅者的Id
   * @type {String}
   */
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户Id'
  },
  /**
   * 群聊Id
   * @type {String}
   */
  group_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '群聊Id'
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await table.sync()

/**
 * 添加订阅
 * @param param - 订阅信息
 * @param param.platform - 订阅的来源，如：github、gitee、gitlab等
 * @param param.owner - 订阅的仓库的拥有者
 * @param param.repo - 订阅的仓库的名称
 * @param param.event - 订阅的仓库的事件类型，如：push、release等
 * @param param.bot_id - 订阅者的机器人Id
 * @param param.user_id - 订阅者的用户Id
 * @param param.group_id - 群聊Id
 */
export async function add ({
  platform,
  owner,
  repo,
  event,
  bot_id,
  user_id,
  group_id
}: {
  platform: string;
  owner: string;
  repo: string;
  event: string[];
  bot_id: string | number;
  user_id: string | number;
  group_id: string | number;
}): Promise<[Model, boolean | null]> {
  group_id = String(group_id)
  user_id = String(user_id)
  bot_id = String(bot_id)
  const data = {
    platform,
    owner,
    repo,
    event,
    bot_id,
    user_id,
    group_id
  }
  return await table.upsert(data) as [Model, boolean | null]
}

/**
 * 获取一条订阅信息
 * @param param - 查询参数对象
 * @param param.platform - 订阅的来源，如：'github'、'gitee'、'gitlab'等
 * @param param.owner - 订阅的仓库的拥有者
 * @param param.repo - 订阅的仓库的名称
 * @param param.user_id - 订阅者的用户Id
 * @param param.group_id - 群聊Id
 * @returns 查询到的订阅信息，如果没有则返回null
 */
export async function get ({
  platform,
  owner,
  repo,
  bot_id,
  user_id,
  group_id
}: {
  platform: string;
  owner: string;
  repo: string;
  bot_id: string | number;
  user_id: string | number;
  group_id: string | number;
}): Promise<Model | null> {
  user_id = String(user_id)
  group_id = String(group_id)
  const data = {
    platform,
    owner,
    repo,
    bot_id,
    user_id,
    group_id
  }
  return await table.findOne({
    where: data
  }) as Model | null
}
/**
 * 获取所有订阅的信息
 * @param param - 查询参数
 * @param param.platform - 订阅的来源，如：github、gitee、gitlab等
 * @param param.owner - 订阅的仓库的拥有者
 * @param param.repo - 订阅的仓库的名称
 * @returns 订阅信息列表
 */
export async function get_all ({
  platform,
  owner,
  repo
}: {
  platform: string;
  owner: string;
  repo: string;
}): Promise<Model[]> {
  const data = {
    platform,
    owner,
    repo
  }
  return await table.findAll({
    where: data
  }) as Model[]
}
