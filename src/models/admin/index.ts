import type { AdminConfigType } from '@/types'

export const AdminTypeConfig: Record<string, AdminConfigType> = {
  other: {
    title: '其他设置',
    cfg: {
      renderScale: {
        title: '渲染精度',
        desc: '设置渲染精度',
        type: 'number',
        limit: '50-200'
      }
    }
  }
}
