import { db } from '@/models'
type Model = db.base.Model

export interface subscriptionType extends Model {
  /** 平台 */
  platform: string
  /** 仓库拥有者 */
  owner: string
  /** 仓库名 */
  repo: string
  /** 事件 */
  event: string[]
  /** 机器人id */
  bot_id: string | number
  /** 用户id */
  user_id: string | number
  /** 群组id */
  group_id: string | number
}
