---
title: 项目开发计划
date: 2025-06-20
category: Note
tags: 
    - Vue
description: 项目
outline: [2,3]
draft: true
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false 
aside: false
---

# **Plan**：

::: details 目录

- [Ant design Vue](https://www.antdv.com/docs/vue/introduce-cna) 
- [element plus](https://element-plus.org/zh-CN/)

[[toc]]

:::

| 项目             | 广轻工计算机类专业（2023） | 你的目标分数（2024） |
| :--------------- | :------------------------- | :------------------- |
| 最低录取分       | 260分（总分450）           | **280分+**（保稳）   |
| 数学要求         | 80分+（100分制）           | **90分**             |
| 语文要求         | 70分+（100分制）           | **75分**             |
| 英语优势科目     | 80分+（100分制）           | **95分+**            |
| **技能证书加成** | 1+X证书可能面试加分        | **重点展示Web项目**  |

**高职校园实战型项目**

**项目名称**：`智能实训室管理系统`
**技术栈**：

- 前端：Vue3 + TS + Pinia + Vant UI（移动端适配）
- 后端：NestJS + MySQL + Redis（缓存）
- 部署：Docker + 阿里云ECS（或Vercel免费托管）
  **核心功能**：
- 学生预约实训室（含扫码签到）
- 设备借还管理（二维码标签）
- 教师后台数据统计（ECharts图表）
  **打动老师的关键点**：
  ✅ 贴合高职院校「产教融合」特色
  ✅ 展示物联网思维（二维码+移动端）
  ✅ 比普通学生作品更贴近实际应用

| 组件         | 选型                   | 白嫖技巧                      | 老师眼中的价值           |
| :----------- | :--------------------- | :---------------------------- | :----------------------- |
| **前端托管** | Netlify                | 自动部署GitHub项目，免费HTTPS | 熟悉CI/CD流程            |
| **后端逻辑** | Netlify Edge Functions | 用JavaScript/TS写API，免运维  | 掌握Serverless和边缘计算 |
| **数据库**   | Supabase               | 免费PostgreSQL+实时API        | 替代Firebase的企业级方案 |
| **身份验证** | Supabase Auth          | 集成JWT/OAuth                 | 展示安全意识             |

全面ESM+Vue3+Vite+Element-Plus+TypeScript编写的一款后台管理系统（兼容移动端）

https://github.com/pure-admin/vue-pure-admin

Nest Framework TypeScript启动器

https://github.com/nestjs/typescript-starter

**技术选型原则**

| 模块          | 推荐轮子                                                     | 你的操作                                                     |
| :------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **前端框架**  | Ant Design Vue / Element Plus                                | 直接使用Admin模板（如[Vue Admin Pure](https://github.com/xiaoxian521/vue-pure-admin)) |
| **后端框架**  | NestJS                                                       | 克隆成熟Boilerplate（如[NestJS Starter](https://github.com/nestjs/typescript-starter)) |
| **身份验证**  | NextAuth.js / NestJS Passport                                | 直接集成，改配置即可                                         |
| **数据库ORM** | Prisma / TypeORM                                             | 使用现成数据模型（如[Prisma示例](https://github.com/prisma/prisma-examples)) |
| **部署**      | Netlify（前端）+ Vercel（Serverless函数）+ Supabase（数据库） | 照搬官方部署指南                                             |

![plan](https://image.yumeng.icu/2025-06-20%2F200355.png)

**开箱即用 仓库**

[NestJS + Vue Admin](https://github.com/anncwb/vue-vben-admin)（含RBAC权限系统）

[在Netlify上托管的Express.JS](https://github.com/neverendingqs/netlify-express)
