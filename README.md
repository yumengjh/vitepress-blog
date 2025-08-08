# 🚀 VitePress 多语言极简博客主题


![VitePress](https://img.shields.io/badge/VitePress-latest-646cff?style=for-the-badge&logo=vitepress)


![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)


基于 VitePress 的现代化多语言极简博客主题，支持中文、英文、日文等多种语言



---

## 🌟 特性亮点

### 🌍 多语言支持
- **中文、英文、日文** 三语言完整支持（可扩展）
- 自动语言检测和路由
- 独立的分页系统
- 可扩展的语言配置

### 🎨 现代化设计
- 响应式布局，完美适配各种设备
- 深色/浅色主题切换
- 图片缩放，懒加载，自动错误图片替换

### 📝 强大的内容管理
- 自动分页生成
- 标签分类系统
- 文章置顶功能
- 草稿模式支持
- 自动模版生成

```bash
npm run new [文件名] [标题] [描述] [标签(逗号分隔)]
```

### 🔍 智能搜索
- Algolia 搜索集成
- Pagefind 本地搜索（默认关闭）
- 多语言搜索支持

### 🌏 数据分析

使用 [umami](https://github.com/umami-software/umami)

- 支持外链跟踪
- 全球数据统计
- 包括浏览器，操作系统，设备，文章点击，停留时间，跳出率，实时等....

需要自行部署，没有服务器的可以使用 [claw.cloud](https://ap-southeast-1.run.claw.cloud/signin) 免费部署

部署后，需自行根据文档进行配置，比如把['script', { defer: true, src: 'https://monitor.*.com/script.js', 'data-website-id': 'e4835023-11111111-b171111425c' }]替换为你的umami的配置

外链跟踪的相关配置已经写好，见https://github.com/yumengjh/vitepress-blog/blob/babb8c7715eec4adf71a11cd7f6e3a442b18a06d/.vitepress/theme/index.js#L66

### 📑 文档放在私有仓库

当然你喜欢和代码放在一起，也是可以的。

执行`npm run pull`，会自动拉取云端文档，并生成对应的md文件，需要配置token

在不是平台执行构建的时候需要先执行`npm run pull`，再`npm run build`

私有云端文档的结构如下：

```txt
en/
    1.md		# 英文文档
    ...
jp/
    1.md		# 日语文档
    ...
1.md			# 中文文档（直接放在根目录即可）
...
```

---

## 📸 预览效果

https://blog.yumeng.icu

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/your-username/vitepress-blog.git
cd vitepress-blog
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

```env
VITE_ALGOLIA_APP_ID=    # Algolia App ID
VITE_ALGOLIA_API_KEY=   # Algolia API Key
VITE_ALGOLIA_INDEX_NAME= # Algolia Index Name
VITE_API_BASE_URL=      # 后端API地址
VITE_AUTH_SECRET_KEY=   # 后端Secret Key
VITE_GITHUB_TOKEN=      # 拉取云端文档Token
VITE_TWIKOO_ENV_ID=     # 评论系统环境ID（https://twikoo.js.org/）
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 📝 Frontmatter 配置

```yaml
---
title: 文章标题
date: 2025-01-01
category: Note
tags: 
    - React
    - Vue
    - JavaScript
description: 文章描述
outline: [2,3]	  
draft: false      # 草稿模式，不显示在文章列表
sticky: false     # 置顶文章
cbf: false        # 代码块折叠（（针对当前页）
zoomable: true    # 图片缩放（针对当前页）
publish: true     # 是否进入RSS
AutoAnchor: false # 是否自动锚点
aside: false      # 侧边栏
noSearch: false   # 是否进入搜索范围（仅限algolia，并且需要配置algolia的爬虫）
comments: false   # 当前页面是否开启评论功能（只有comments为false时，才会不开启评论，不写或者写true时，会开启评论）
---
```

---

## 🎯 核心功能

### 📸 图片功能
```markdown
![图片描述](图片地址){title='图片标题' no-zoom no-style width='80%'}
```

- `no-zoom` - 禁用当前图片缩放
- `no-style` - 禁用默认样式
- `title` - 图片标题
- 自动错误占位图
- 懒加载优化

### 🏷️ 标签分类系统
<details>
<summary>📸 查看效果</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.9o02kwm3q8.webp' alt="标签分类">
</details>

### 📚 常用书签

需要搭配后端使用

<details>
<summary>📸 查看效果</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.4jodvmndj1.webp' alt="书签功能">
</details>

### 📦 代码块折叠
<details>
<summary>📸 查看效果</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.7eh21favs8.webp' alt="代码折叠">
</details>

### ⏱️ 时间轴功能
```markdown
::: timeline 2025-04-07
- **标题**
- 添加 `cleanUrls: true` 配置
- 生成的 HTML 页面不带有 .html 后缀
:::
```

<details>
<summary>📸 查看效果</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.73u889x5bk.webp' alt="时间轴">
</details>

### 🔍 智能搜索
- **Algolia 搜索**：云端搜索，速度快
- **Pagefind 搜索**：本地搜索，隐私保护
- **多语言搜索**：支持中英文搜索

### 💬 评论系统
使用 https://twikoo.js.org/


### 📊 RSS 订阅
```bash
npm i vitepress-plugin-rss
```

### 🎨 自动锚点
![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/cat.3uv4bmcg59.gif)


### ❓ 其他功能请自行


其中有些代码或者组件是废弃的，请忽略。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

使用到的库：

[VitePress](https://vitepress.dev/)
[axios](https://axios-http.com/)
[crypto-js](https://cryptojs.gitbook.io/docs/)
[dotenv](https://www.npmjs.com/package/dotenv)
[medium-zoom](https://github.com/francoischalifour/medium-zoom)
[twikoo](https://twikoo.js.org/)
[vitepress-plugin-nprogress](https://github.com/yume-chan/vitepress-plugin-nprogress)
[vitepress-plugin-pagefind](https://github.com/yume-chan/vitepress-plugin-pagefind)
[vitepress-plugin-rss](https://github.com/yume-chan/vitepress-plugin-rss)
[vitepress-markdown-timeline](https://github.com/yume-chan/vitepress-markdown-timeline)
[vitepress-plugin-codeblocks-fold](https://github.com/yume-chan/vitepress-plugin-codeblocks-fold)

参考了[airene/vitepress-blog-pure](https://github.com/airene/vitepress-blog-pure)的博客

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

[![GitHub stars](https://img.shields.io/github/stars/your-username/vitepress-blog?style=social)](https://github.com/your-username/vitepress-blog)

</div>

