import { DataTypes, sequelize } from '@/models/db/base'
import { dbType } from '@/types'
type Model = dbType['github']

/**
 * GitHub用户数据
 */
export const table = sequelize.define('github', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: '主键id'
  },
  botId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '机器人id'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户Id'
  },
  github_username: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户名'
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户Token'
  },
  expires_in: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Token过期时间'
  },
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '刷新Token'
  },
  refresh_token_expires_in: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '刷新Token过期时间'
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  },
  indexes: [
    {
      unique: true,
      fields: ['botId', 'userId']
    }
  ]
})

await table.sync()

/**
 * 添加用户信息
 * @param param - 用户信息对象
 * @param param.userId - 用户ID
 * @param param.state_id - 状态ID
 * @param param.access_token - 访问令牌
 * @param param.expires_in - 过期时间
 * @param param.refresh_token - 刷新令牌
 * @param param.refresh_token_expires_in - 刷新令牌过期时间
 * @returns 包含模型实例和操作结果的元组
 */
export async function add ({
  botId,
  userId,
  github_username,
  access_token = null,
  expires_in = null,
  refresh_token = null,
  refresh_token_expires_in = null
}: {
  botId: string,
  userId: string,
  github_username: string,
  access_token: string | null,
  expires_in: number | null,
  refresh_token: string | null,
  refresh_token_expires_in: number | null
}): Promise<[Model, boolean | null]> {
  const data = {
    botId,
    userId,
    github_username,
    access_token,
    expires_in,
    refresh_token,
    refresh_token_expires_in
  }
  return await table.upsert(data) as [Model, boolean | null]
}

/**
 * 获取用户信息
 * @param botId - 机器人ID
 * @param userId - 用户ID
 * @param [github_username] - 用户名(github的登录名)，可选参数
 * @returns 用户信息
 */export async function get (
  {
    botId,
    userId,
    github_username
  }:{
    botId: string,
    userId: string,
    github_username?: string
  }): Promise<Model | null> {
  const data: {
    botId: string;
    userId: string;
    github_username?: string;
  } = {
    botId,
    userId
  }
  if (github_username) {
    data.github_username = github_username
  }
  return await table.findOne({
    where: data
  }) as Model | null
}
