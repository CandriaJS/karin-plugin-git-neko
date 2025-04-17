# <h1 align="center">清语Git插件</h1>
<div align="center">
<img src="https://socialify.git.ci/ClarityJS/karin-plugin-git-neko/image?font=Inter&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Auto" alt="karin-plugin-git-neko" width="640" height="320" />
<img src="https://api.wuliya.cn/api/count?name=karin-plugin-git-neko&type=img&theme=gelbooru" alt="Git插件">

<a href="https://github.com/ClarityJS/karin-plugin-git-neko"><img src="https://img.shields.io/badge/Github-Git插件-black?style=flat-square&logo=github" alt="Github"></a><a href="https://github.com/KarinJS/Karin"><img src="https://badgen.net/npm/v/node-karin?label=Karin" alt="Gitee">></a><a href="https://qm.qq.com/q/gBs8Ri3nIQ"><img src="https://img.shields.io/badge/group-272040396-blue" alt="Group"></a>

<img alt="Star" src="https://badgen.net/github/stars/ClarityJS/karin-plugin-git-neko"><img alt="Fork" src="https://badgen.net/github/forks/ClarityJS/karin-plugin-git-neko"><img alt="Tag Version" src="https://badgen.net/github/tag/ClarityJS/karin-plugin-git-neko"><img alt="Release" src="https://badgen.net/github/release/ClarityJS/karin-plugin-git-neko/stable"><img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/ClarityJS/karin-plugin-git-neko">


</div>

## 介绍 📝
`清语Git插件` 是一个 `Yunzai-Bot` | `Karin` 的扩展插件，提供Bot对`GitHub`, `Gitee`, `GitCode`进行操作等功能。

如有问题请提交 `issue` 或加入 Q 群: `272040396` 📬
本插件大部分功能由核心库支持，有问题请去核心库提交 `issue`，本插件补绘直接上传文件等功能

> [!Tip]
> 本插件刚需机器人需要公网环境，否则无法正常使用。

> [!Warn]
> 开发中

## 安装与更新 🔧

   
<details>
  <summary><code>Karin</code> 🤖</summary>
    <details>
    <summary>使用 <code>Github</code> 🐙</summary>

```bash
git clone --depth=1 -b build https://github.com/ClarityJS/karin-plugin-git-neko ./plugins/karin-plugin-git-neko/
```
  </details>

  <details>
    <summary>使用 <code>Github</code> 镜像 🌐</summary>

```bash
git clone --depth=1 -b build https://gh.wuliya.xin/https://github.com/ClarityJS/karin-plugin-git-neko ./plugins/karin-plugin-git-neko/
```

  </details>
    <details>
    <summary>使用 <code>包管理器</code> 📦</summary>

```bash
pnpm add karin-plugin-git-neko@latest -w
```

  </details>

  <details>
    <summary>使用 <code>Release</code> 🔨</summary>

在 [Release](https://github.com/ClarityJS/karin-plugin-git-neko/releases/latest) 页面下载`build.zip`最新版本，解压后修改文件夹名称为 `karin-plugin-git-neko` 然后放入 `plugins` 文件夹中即可使用。

    **虽然此方式能够使用，不利于后续升级，故不推荐使用 🔔**
  </details>
</details>

<!-- ### <code>Karin</code> 🤖
请前往 [Karin仓库](https://github.com/ClarityJS/karin-plugin-git) -->

### 安装依赖 📦
```bash
pnpm install --filter=karin-plugin-git-neko
```

<!-- ## 使用帮助 ℹ️
其他内容请查看 [官方文档](https://docs.wuliya.cn/clarity/meme)
> [!Tip]
> 如果遇到出现错误可尝试自建后端 -->


## 文档
***初次使用请务必查看文档**

- [文档](https://docs.wuliya.cn/clarity/git-neko-plugin)

## 更新计划 🛠

- [ ] 无公网支持(未来也许会实现, bushi) 
- [ ] 自动清理无效订阅
- [ ] github app自动刷新授权
- [ ] 分离`server`模块

## 贡献者 👨‍💻👩‍💻

<a href="https://github.com/ClarityJS/karin-plugin-git-neko/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ClarityJS/karin-plugin-git-neko" />
</a>

![Alt](https://repobeats.axiom.co/api/embed/04d06e4e2d0cdfb7ef436a681dee7a2c83f199a6.svg "Repobeats analytics image")

# 资源 📚

- [Karin](https://github.com/KarinJS/Karin) ：轻量、高效、简洁的 NodeJS 机器人框架
- [git-neko-kit](https://github.com/ClarityJS/git-neko-kit): Gitee,GitHub, GitCode等API封装库 ***本插件的核心库***
