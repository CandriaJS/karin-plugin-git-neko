import { HelpType } from '@/types'
type HelpListType = HelpType['helpList']

export const helpList:HelpListType = [
  {
    group: '[]内为必填项,{}内为可选项'
  },
  {
    group: '应用帮助',
    list: [
      {
        icon: 34,
        title: '{#}github应用安装',
        desc: '安装GitHub Apps应用'
      },
      {
        icon: 34,
        title: '{#}github应用管理',
        desc: '管理GitHub Apps应用'
      }
    ]
  },
  {
    group: '授权帮助',
    list: [
      {
        icon: 35,
        title: '{#}github授权安装',
        desc: '进行GitHub App 应用授权'
      },
      {
        icon: 35,
        title: '{#}github授权检查',
        desc: '检查GitHub App 应用授权状态'
      },
      {
        icon: 35,
        title: '{#}github授权刷新',
        desc: '刷新GitHub App 应用授权状态'
      }
    ]
  },
  {
    group: '绑定帮助',
    list: [
      {
        icon: 71,
        title: '{#}github用户绑定xxx',
        desc: '绑定GitHub用户'
      },
      {
        icon: 71,
        title: '{#}github仓库绑定xxx',
        desc: '绑定当前群聊的GitHub仓库'
      }
    ]
  },
  {
    group: '提交帮助',
    list: [
      {
        icon: 124,
        title: '{#}github提交信息[owner][repo]{sha}',
        desc: '获取指定sha或默认分支最新提交的提交信息'
      }
    ]
  },
  {
    group: '仓库帮助',
    list: [
      {
        icon: 129,
        title: '{#}github仓库信息{owner}{repo}',
        desc: '获取指定仓库信息'
      },
      {
        icon: 129,
        title: '{#}github组织仓库列表[org]',
        desc: '获取指定组织的仓库列表'
      },
      {
        icon: 129,
        title: '{#}github用户仓库列表{user}',
        desc: '获取指定用户的仓库列表'
      }
    ]
  },
  {
    group: '议题帮助',
    list: [
      {
        icon: 142,
        title: '{#}github议题信息{owner}{repo}[issue_number]',
        desc: '获取指定议题信息'
      },
      {
        icon: 142,
        title: '{#}github议题创建{owner}{repo}[title]',
        desc: '在指定仓库创建议题'
      }
    ]
  },
  {
    group: '用户帮助',
    list: [
      {
        icon: 155,
        title: '{#}github用户信息{username}',
        desc: '获取指定用户信息'
      }
    ]
  },
  {
    group: '订阅帮助',
    list: [
      {
        icon: 158,
        title: '{#}github订阅[owner][repo]{branch}',
        desc: '订阅指定仓库的指定分支'
      }
    ]
  }
]
