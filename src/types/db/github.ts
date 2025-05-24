import { db } from '@/models'
type Model = db.base.Model
export interface githubType extends Model {
  /** 主键id */
  id: number
  /** 机器人Id */
  botId: string
  /** 用户id */
  userId: string
  /** Github用户名 */
  github_username: string
  /** access_token */
  access_token: string | null
  /** 过期时间 */
  expires_in: number | null
  /** 刷新token */
  refresh_token: string | null
  /** 刷新token过期时间 */
  refresh_token_expires_in: number | null
}
