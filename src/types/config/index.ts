import { githubType } from '@/types/config/github'
import { otherType } from '@/types/config/other'
import { proxyType } from '@/types/config/proxy'

export interface ConfigType {
  /** Github 配置 */
  github: githubType,
  /** 代理配置 */
  proxy: proxyType
  /** 其他配置 */
  other: otherType,
}
