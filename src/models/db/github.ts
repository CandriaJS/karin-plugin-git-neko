import { DataTypes, sequelize } from '@/models/db/base'
import { dbType } from '@/types'
type Model = dbType['github']

/**
 * GitHub用户数据
 */
export const table = sequelize.define('github', {
  /**
   * 用户Id
   */
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
    comment: '用户Id'
  },
  /**
   * 用户授权时的状态码
   */
  state_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户对应的的状态码'
  },
  /**
   * 用户Token
   */
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '用户Token'
  },
  /**
   * 过期剩余时间
   */
  expires_in: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Token过期时间'
  },
  /**
   * 刷新Token
   */
  refresh_token: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '刷新Token'
  },
  /**
   * 刷新Token过期时间
   */
  refresh_token_expires_in: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '刷新Token过期时间'
  }
}, {
  freezeTableName: true,
  defaultScope: {
    raw: true
  }
})

await table.sync()

/**
 * 添加用户信息
 * @param param - 用户信息对象
 * @param param.user_id - 用户ID
 * @param param.state_id - 状态ID
 * @param param.access_token - 访问令牌
 * @param param.expires_in - 过期时间
 * @param param.refresh_token - 刷新令牌
 * @param param.refresh_token_expires_in - 刷新令牌过期时间
 * @returns 包含模型实例和操作结果的元组
 */
export async function add ({
  user_id,
  state_id,
  access_token,
  expires_in,
  refresh_token,
  refresh_token_expires_in
}: {
  user_id: string,
  state_id: string,
  access_token: string,
  expires_in: number | null,
  refresh_token: string | null,
  refresh_token_expires_in: number | null
}): Promise<[Model, boolean | null]> {
  user_id = String(user_id)
  state_id = String(state_id)
  const data = {
    user_id,
    state_id,
    access_token,
    expires_in,
    refresh_token,
    refresh_token_expires_in
  }
  return await table.upsert(data) as [Model, boolean | null]
}

/**
 * 获取用户信息
 * @param user_id - 用户ID
 * @returns 查询到的用户信息，如果没有则返回null
 */
export async function get (user_id: string): Promise<Model | null> {
  return await table.findOne({
    where: {
      user_id
    }
  }) as Model | null
}
