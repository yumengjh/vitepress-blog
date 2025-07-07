# vitepress theme blog 

<img src="./assets/image.2a5dc6q3fs.webp" width=40% style="display:inline"><img src="https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.2a5dc6tz5s.webp" width=40% style="display:inline">
<img src="https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.6f0yoasmhb.webp" width=10% style="">
## 介绍


这是一个基于 vitepress 的博客主题，扩展了其功能。

## 部署平台

帽子云：https://myblog-8n5nv0mo.maozi.io/

Netlify：https://yumng.netlify.app

Vercel：...

## frontmatter

```js
title: ${title}
date: ${date}
category: Note
tags: 
    - ${tags.split(',').join('\n    - ')}
description: ${description}
outline: [2,3]
draft: false	// 不显示在文章列表
sticky: false	// 置顶
cbf: false	// 是否开启代码块折叠
zoomable: true	// 是否开启图片缩放
publish: true	// 文章是否进入RSS
AutoAnchor: false	// 是否自动开启自动锚点
aside: false	// 侧边栏
noSearch: false 	// 是否进入搜索范围（需要Algolia配置）
comments: false		// 是否开启搜索
```

## 图片功能

```markdown
![图片描述](图片地址){title='图片标题' no-zoom no-style width='80%'}
```

- no-zoom 当前图片不开启缩放
- no-style 当前图片不使用默认样式
- title 图片的标题

## 功能

### 标签分类

<details>
<summary>图片</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.9o02kwm3q8.webp'>
</details>

### 常用书签

<details>
<summary>图片</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.4jodvmndj1.webp'>
</details>

### 代码块折叠

<details>
<summary>图片</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.7eh21favs8.webp'>
</details>

### 加载进度条

**顶部加载进度条**

### md语法时间轴

```markdown
::: timeline 2025-04-07
- **美化URL地址**
- 添加 `cleanUrls: true` 配置
- 生成的 HTML 页面不带有 .html 后缀
:::
```

<details>
<summary>图片</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.73u889x5bk.webp'>
</details>

### 自动锚点

![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/cat.3uv4bmcg59.gif)

### 图片缩放

<details>
<summary>图片</summary>
<img src='https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/cat.45yqdwuy6.gif'>
</details>

### 错误图片占位

当图片加载失败会显示占位图片，支持浅色和深色主题

![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/loading-error-light.73u88a4mrt.webp)

![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/loading-error-dark.2h8l7l7t5v.webp)

### 图片标题

```markdown
![Tom](https://*********/images/tom.jpg){title="Tom" width="100" height="100" no-zoomable}
```



![image-20250707133643316](./assets/image-20250707133643316.png)

### 评论功能

![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/cat.99tmu2aeea.gif)

### 一键生成文档模板

![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/cat.83ablgrrhk.gif)

### RSS

```bash
npm i vitepress-plugin-rss
```

### 基于Pagefind的搜索

...

### 增强Algolia搜索

需要配合在控制台中加上：
```ts
actions: [
  {
    indexName: "yumeng",
    recordExtractor: ({ $, helpers }) => {
      // 如果 Frontmatter 包含 noindex: true，跳过该页面
      if ($('meta[property="noSearch"]').length > 0) {
        return [];
      }
      return helpers.docsearch({
        // 原有配置...
      });
    }
  }
]
```

### 国际化（中英）

...

### 文章元信息

**计算相对时间**：

![](https://cdn.jsdelivr.net/gh/yumengjh/picx-images-hosting@master/vitepress-blog/image.2obt31fqea.webp)

