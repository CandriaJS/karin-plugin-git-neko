import { db } from '@/models'
type Model = db.base.Model
export interface githubType extends Model {
  /** 用户id */
  user_id: string
  /** 状态id */
  state_id: string
  /** access_token */
  access_token: string | null
  /** 过期时间 */
  expires_in: number | null
  /** 刷新token */
  refresh_token: string | null
  /** 刷新token过期时间 */
  refresh_token_expires_in: number | null
}
