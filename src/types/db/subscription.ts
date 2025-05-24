import { db } from '@/models'
type Model = db.base.Model

export interface subscriptionType extends Model {
  /** 平台 */
  platform: string
  /** 仓库拥有者 */
  owner: string
  /** 仓库名 */
  repo: string
  /** 分支名 */
  branch: string
  /** 事件 */
  event: string[]
  /** 机器人id */
  botId: string | number
  /** 用户id */
  userId: string | number
  /** 群组id */
  groupId: string | number
}
