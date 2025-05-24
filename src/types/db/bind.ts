import { db } from '@/models'
type Model = db.base.Model

export interface bindType extends Model {
  /** 主键id */
  id: number
  /** 平台类型，github/gitee/gitcode */
  platform: string
  /** 机器人Id */
  botId: string
  /** 用户id */
  userId: string
  /** 群组Id */
  groupId: string
  /** 仓库拥有者 */
  owner: string
  /** 仓库名 */
  repo: string
  /** 仓库分支 */
  branch: string
}
