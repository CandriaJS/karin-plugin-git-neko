import { DataTypes, sequelize } from '@/models/db/base'
import { dbType } from '@/types'
type Model = dbType['subscription']

export const table = sequelize.define('subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '平台类型'
  },
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
  branch: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '仓库分支'
  },
  event: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '订阅类型'
  },
  botId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '机器人Id'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户Id'
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '群聊Id'
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  },
  indexes: [
    {
      unique: true,
      fields: ['platform', 'owner', 'repo', 'botId', 'userId', 'groupId']
    }
  ]
})

await table.sync()

/**
 * 添加订阅
 * @param param - 订阅信息
 * @param param.platform - 订阅的来源，如：github、gitee、gitlab等
 * @param param.owner - 订阅的仓库的拥有者
 * @param param.repo - 订阅的仓库的名称
 * @param param.event - 订阅的仓库的事件类型，如：push、release等
 * @param param.botId - 订阅者的机器人Id
 * @param param.userId - 订阅者的用户Id
 * @param param.groupId - 群聊Id
 */
export async function add ({
  platform,
  owner,
  repo,
  branch,
  event,
  botId,
  userId,
  groupId
}: {
  platform: string;
  owner: string;
  repo: string;
  branch: string;
  event: string[];
  botId: string | number;
  userId: string | number;
  groupId: string | number;
}): Promise<[Model, boolean | null]> {
  groupId = String(groupId)
  userId = String(userId)
  botId = String(botId)
  const data = {
    platform,
    owner,
    repo,
    branch,
    event,
    botId,
    userId,
    groupId
  }
  return await table.upsert(data) as [Model, boolean | null]
}

/**
 * 获取一条订阅信息
 * @param param - 查询参数对象
 * @param param.platform - 订阅的来源，如：'github'、'gitee'、'gitlab'等
 * @param param.owner - 订阅的仓库的拥有者
 * @param param.repo - 订阅的仓库的名称
 * @param param.userId - 订阅者的用户Id
 * @param param.groupId - 群聊Id
 * @returns 查询到的订阅信息，如果没有则返回null
 */
export async function get ({
  platform,
  owner,
  repo,
  botId,
  userId,
  groupId
}: {
  platform: string;
  owner: string;
  repo: string;
  botId: string;
  userId: string;
  groupId: string | number;
}): Promise<Model | null> {
  const data = {
    platform,
    owner,
    repo,
    botId,
    userId,
    groupId
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
