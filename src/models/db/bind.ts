import { DataTypes, sequelize } from '@/models/db/base'
import { dbType } from '@/types'
type Model = dbType['bind']

export const table = sequelize.define('bind', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键Id'
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    comment: '平台类型'
  },
  botId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    comment: '机器人Id'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    comment: '用户Id'
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    comment: '群组Id'
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '仓库的拥有者'
  },
  repo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '仓库名称'
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await table.sync()

/**
 * 通过群组ID和机器人ID获取绑定信息
 * @param platform - 平台类型
 * @param botId - 机器人ID
 * @param userId - 用户ID
 * @param groupId - 群组ID
 * @returns 绑定信息
 */
export async function get ({
  platform,
  botId,
  userId,
  groupId
}: {
  platform: string
  botId: string
  userId: string
  groupId: string
}): Promise<Model | null> {
  platform = String(platform)
  botId = String(botId)
  userId = String(userId)
  groupId = String(groupId)
  const data = {
    platform,
    botId,
    userId,
    groupId
  }
  return await table.findOne({
    where: data
  }) as Model | null
}

/**
 * 添加绑定信息
 * @param param 参数对象
 * @param botId - 机器人ID
 * @param groupId - 群组ID
 * @param platform - 平台类型
 * @param owner - 仓库的拥有者
 * @param repo - 仓库名称
 * @param branch - 仓库分支
 * @returns 绑定信息
 */
export async function add ({
  platform,
  botId,
  userId,
  groupId,
  owner,
  repo
}: {
  platform: string
  botId: string
  userId: string
  groupId: string
  owner: string
  repo: string
}): Promise<[Model, boolean | null]> {
  botId = String(botId)
  groupId = String(groupId)
  userId = String(userId)
  platform = String(platform)
  owner = String(owner)
  repo = String(repo)
  const data = {
    platform,
    botId,
    userId,
    groupId,
    owner,
    repo
  }
  return await table.upsert(data) as [Model, boolean | null]
}
