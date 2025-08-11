#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// 获取命令行参数
const args = process.argv.slice(2)
const [fileName = `post-${Date.now().toString().slice(9, 14)}`, title = 'My article', description = '默认描述', tags = '默认标签'] = args

// 获取当前日期
const date = new Date().toISOString().split('T')[0]

// 生成frontmatter
const frontmatter = `---
title: ${title}
date: ${date}
update: ${date}
category: Note
tags: 
    - ${tags.split(',').join('\n    - ')}
description: ${description}
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
noSearch: false 
author: 鱼梦江湖
---

::: details 目录
[[toc]]
:::

`

try {
    // 确保posts目录存在
    const postsDir = path.join(process.cwd(), 'posts')
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir)
    }

    // 创建文件
    const filePath = path.join(postsDir, `${fileName}.md`)

    // 检查同名文件是否已存在
    if (fs.existsSync(filePath)) {
        console.error(`❌ 创建失败：文件已存在 -> ${filePath}`)
        process.exit(1)
    }

    fs.writeFileSync(filePath, frontmatter)

    console.log(`\n✨ 文章创建成功！`)
    console.log(`📝 文件路径: ${filePath}`)
    console.log(`\n使用方法：`)
    console.log(`npm run new [文件名] [标题] [描述] [标签(逗号分隔)]`)
    console.log(`示例：npm run new my-post "我的文章" "这是描述" "标签1,标签2"`)

} catch (error) {
    console.error('❌ 创建文章失败:', error)
}