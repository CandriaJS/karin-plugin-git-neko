import { bindType } from '@/types/db/bind'
import { githubType } from '@/types/db/github'
import { subscriptionType } from '@/types/db/subscription'

export interface dbType {
  github: githubType
  bind: bindType
  subscription: subscriptionType
}
