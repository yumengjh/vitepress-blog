---
title: 日常开发中常会遇到的一些场景与对应操作命令，帮助你提高效率、避免踩坑。
date: 2025-07-04
category: Note
tags: 
    # - 
description: 日常开发中常会遇到的一些场景与对应操作命令，帮助你提高效率、避免踩坑。
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
---

::: details 目录
[[toc]]
:::

## 删除某些Git提交记录，但是保存本地更改

**仅删除 Git 提交记录**（但保留所有本地文件修改），比如**删除 `8f2c3b570` 之前的所有提交记录**，**保留所有文件修改**（工作区内容不变），**生成一个新的初始提交**（包含当前所有代码）。

**步骤**：

重置到目标提交（保留文件修改）

```bash
git reset --soft 8f2c3b570  # 回退到该提交，但保留所有文件改动
```

重新提交所有文件（作为新起点）

```bash
git add .                   # 添加所有修改
git commit -m "Initial commit (after reset)"
```

强制推送到远程（如需）

```bash
git push --force origin <分支名>  # 谨慎操作！确保团队知晓
```

效果验证

执行 `git log`：只会看到新提交 `"Initial commit (after reset)"`