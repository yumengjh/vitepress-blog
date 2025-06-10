---
title: 临时记录的一些东西，包括但不限于
     学习日志
     代码片段
     个人笔记
date: 2025-05-22
category: Note
tags: 
    - Error
    - Chrome
    - Tool
description: 本篇笔记用于临时记录学习过程中的各种内容，包括学习日志、代码片段以及个人笔记等，方便后续查阅和总结。
outline: [2,3]
draft: false
sticky: true
done: false
gridPaper: false
handwriting: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
---

# 笔记


clash-verge 默认全局扩展覆写配置

```yaml
# Profile Enhancement Merge Template for Clash Verge

profile:
  store-selected: true

dns:
  use-system-hosts: false


```

信息传播现状：

![](https://image.yumeng.icu/2025-05-25%2F222215.png)

## 自定义语法

如果你在开发一个框架，但是现在又不打算开发IDE插件用来语法高亮等，可以使用 custom-data 

`custom-data` 是一套 Web IDE 支持的配置格式（由 [vscode-html-languageservice](https://github.com/microsoft/vscode-html-languageservice) 提供），它允许你：

- 定义自定义 HTML 标签
- 定义自定义属性（如指令）
- 添加文档说明、值提示、类型检查等

创建一个 custom-data.json 文件

比如：

```js
{
  "version": 1.1,
  "tags": [
    {
      "name": "div",  // 所有 HTML 标签都能继承
      "attributes": [
        {
          "name": "m-for",
          "description": "Mist.js 的循环指令。例：m-for=\"item in list\""
        },
        {
          "name": "m-if",
          "description": "Mist.js 的条件渲染指令。例：m-if=\"visible\""
        },
        {
          "name": "m-bind",
          "description": "Mist.js 的属性绑定。例：m-bind:title=\"msg\""
        },
        {
          "name": "m-model",
          "description": "Mist.js 的双向绑定。例：m-model=\"username\""
        }
      ]
    }
  ]
}
```

打开 VS Code 设置（`.vscode/settings.json` 或用户设置），添加如下配置：

```json
{
  "html.customData": [
    "./custom-data.json"
  ]
}
```

重启后，在 `.html` 文件中即可使用了
