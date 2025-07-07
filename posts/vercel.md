---
title: Vercel 踩坑手记，上手实践，注意事项
date: 2025-07-07
category: Note
tags: 
    - Vercel
description: 涵盖初学记录、专题整理、踩坑复盘
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
noSearch: false 
---

::: details 目录
[[toc]]
:::

# Vercel

## Vercel ServerLess Functions

在Vercel上部署一些后端，并且可以使用框架，比如Nodejs的NestJS，NestJS是一个完整的框架，依赖于各种原生模块，而 Vercel 的 **Edge Functions** 和 Netlify 的 **Edge Functions** 一样，是基于 Web 标准的 [**V8 Isolates Runtime**]：

- 没有完整的 Node.js 环境（如不支持 `fs`、`net`、`child_process` 等模块）
- 要求函数体积小、冷启动极快（通常在几毫秒内）
- 目标是快速处理边缘计算逻辑（如 A/B 测试、Header 注入、URL 重写）

所以部署NestJS使用的是 **Vercel Serverless Functions**

- 支持完整的 Node.js 运行时（14.x、16.x 等）
- NestJS 可以打包成一个单独的 Serverless handler 运行在这上面

NestJS 基于 Node.js 原生模块（`http`、`stream`、`events` 等）构建，而 **Vercel 的 Serverless Functions 提供了完整 Node.js 运行时支持**，这对 Nest 来说是硬性要求。

而Netlify 的 Serverless 环境对 Node 支持较弱，且对大项目支持力不够。

Vercel 不强制要求你的代码结构必须符合某种规范，只要你指定：

```json
"builds": [{ "src": "api/index.ts", "use": "@vercel/node" }]
```

它就可以构建任何你想要的 Node 项目，包括 NestJS、Express、甚至 Koa、Fastify 等。

Vercel 会：

- 自动识别 TypeScript 并构建
- 自动缓存构建输出，加快部署
- 一键生成并部署函数入口，无需复杂配置文件（像 `netlify.toml`）

**零服务器，按需扩展**

NestJS 在 Vercel 上运行的是无状态函数：

- 请求触发即启动（cold start），执行完即销毁
- 不需要你维护服务器，也不会被“挂掉”
- 自动扩容（并发量大自动复制多个实例）

**Edge 与 Serverless 配合灵活**

- 用 **Edge Function** 做前置处理（如判断区域、权限）
- 用 **Serverless Function** 执行 NestJS 后端逻辑

**注意** ：**Vercel Serverless Functions 中的文件操作是**临时的、非持久化的、每次 cold start 都会重置！
 简单说：**可以读写临时文件，但无法保存状态或持久存储。**

你可以读取代码打包时包含的静态文件，这个文件必须是在**构建时打包进 Serverless 函数的**，可以读取 ✔️，不能修改、删除、持久保存 ❌

```js
import * as fs from 'fs';
const content = fs.readFileSync('./data/config.json', 'utf-8');
```

可以写入到 `/tmp` 目录，这是每个 Serverless 函数专属的**临时文件目录**：

```js
fs.writeFileSync('/tmp/hello.txt', 'test');
```

- ✅ 可以写入
- ✅ 读写速度快
- ❌ **函数结束或容器被销毁后文件就没了**
- ❌ 不能用于用户上传的文件、日志、缓存等长期存储

只在当前请求期间有效，一旦容器销毁就没了。

🔝 **常见免费云存储服务对比**

| 服务名称                | 免费额度                    | 适合用途               | 是否易于与 Vercel 搭配 |
| ----------------------- | --------------------------- | ---------------------- | ---------------------- |
| **Vercel Blob**（官方） | ✔️ 免费 100GB/月（开发阶段） | 文件上传、CDN 文件     | ✅ 原生集成             |
| **Cloudflare R2**       | ✔️ 10GB 存储 + 1GB 出站流量  | 静态文件、S3 兼容      | ✅ 配合 AWS SDK 使用    |
| **Backblaze B2**        | ✔️ 10GB 存储 + 1GB/月下载    | 图片、文档等           | ✅ S3 兼容 API          |
| **Firebase Storage**    | ✔️ 1GB 存储 + 5GB/月下载     | 移动端/前端文件        | ✅ 多平台支持           |
| **Supabase Storage**    | ✔️ 1GB 存储（免费层）        | 与 Supabase 数据库结合 | ✅ 全栈集成好           |
| **UploadThing**         | ✔️ 每月 1GB（带限制）        | 前端文件上传托管       | ✅ Vercel 插件          |
| **ImageKit.io / Imgix** | ✔️ 免费处理 20GB 图片/月     | 图片优化、CDN          | ✅ 图片为主             |

**Vercel Blob**：

| 项目         | 限制                     | 是否可配置          |
| ------------ | ------------------------ | ------------------- |
| 单文件大小   | 50MB                     | ❌                   |
| 存储总量     | 100GB（默认）            | ❌（付费计划可扩展） |
| 上行带宽     | 没有限制，但无分片上传   | ❌                   |
| 出站带宽     | 暂无限制                 | ❌（未来可能有）     |
| 私有访问     | 支持 token 和 URL 签名   | ✅                   |
| 文件生命周期 | 永久保存（除非手动删除） | ❌                   |

> ⚠️ 超过 50MB 上传会失败，目前不适合视频或大数据文件。

注意：不支持子目录，如 `images/avatar.png` 会变成 `images%2Favatar.png`，文件名中的 `/` 会被转义，不是真目录结构，不支持目录操作，所有 Blob 都是平铺的对象名。

**权限控制**

| 功能         | 支持情况                      |
| ------------ | ----------------------------- |
| 公开访问文件 | ✅ 支持                        |
| 私有 Blob    | ✅ 支持（带 token 的私有访问） |
| URL 签名访问 | ✅ 可设置有效时间              |
| 文件删除     | ✅ 可通过 API 删除             |

**签名 URL（Signed URL）是一种带有“访问令牌 + 时效性”的特殊下载链接**，只有持有这个链接的人，才能在限定时间内访问目标文件。

**场景**：

你有一个用户上传了简历 `resume.pdf`，这个文件是私密的，不能让其他人随便访问。但你希望他自己能下载、分享给 HR，怎么办？

1. 上传时设置为私有文件（不可公开访问）
2. 需要访问时，通过你的后端生成一个签名 URL，设定：
   - 谁可以访问（token 内隐含）
   - 什么时候过期（如 5 分钟内有效）
3. 用户使用这个 URL 下载文件（有效期间有效）

```text
用户上传文件 → 存储为私有 Blob
                        ↓
用户发请求获取下载链接（需身份验证）
                        ↓
后端生成 Signed URL（5 分钟有效）
                        ↓
返回给用户，用户用 URL 下载
```

**Vercel 的 Serverless Functions 存在冷启动现象** 

**什么是冷启动？**

当一个 Serverless Function 被**首次请求，或一段时间未被访问后**，Vercel 会重新**创建一个执行实例**来处理请求。这种初始化过程就是“冷启动”。

**冷启动的典型表现**：

| 请求状态               | 响应速度                | 说明                             |
| ---------------------- | ----------------------- | -------------------------------- |
| 第一次请求             | 🐢 慢（数百毫秒 ~ 2 秒） | 初始化容器、加载依赖、构建上下文 |
| 连续多次访问           | ⚡ 快（几十毫秒）        | 函数“热状态”，实例已存在         |
| 几分钟无访问后再次请求 | 🐢 又慢了                | 实例被销毁，重新启动（冷启动）   |

Serverless 的核心设是 **“按需创建 + 自动销毁”**：

| 原因       | 说明                                           |
| ---------- | ---------------------------------------------- |
| 节省资源   | 没有请求就不占资源，不用付费                   |
| 高弹性     | 可同时起多个实例处理并发请求                   |
| 生命周期短 | 空闲后几分钟内就被销毁（由平台控制，不能配置） |

**冷启动时间范围参考**

| 框架类型                | 典型冷启动时间             |
| ----------------------- | -------------------------- |
| 轻量函数（Hello World） | 100~300ms                  |
| 中型框架（Express）     | 300~800ms                  |
| 重型框架（NestJS）      | 500ms~2s（视依赖数量而定） |

**如何缓解冷启动？**

虽然 Vercel 不提供强制“保持热实例”的方式，但你可以尝试以下技巧：

| 方法                      | 效果       | 实现方式                                                     |
| ------------------------- | ---------- | ------------------------------------------------------------ |
| **代码精简**              | ✅ 显著     | 减少不必要的依赖和装饰器                                     |
| **分包部署**              | ✅ 好       | 拆分业务为多个小函数                                         |
| **预热请求**              | ⚠️ 可缓解   | 定时发送请求让函数保持活跃（如用 cron job ping）             |
| **Edge Function 替代**    | ✅ 无冷启动 | 适合处理轻量逻辑，但不能用 NestJS                            |
| **不要用 `app.listen()`** | ✅ 必须     | NestJS 在 Serverless 模式下要用 `expressAdapter.getHandler()` |

轮询或定时心跳请求可以让 Serverless 实例保持“活跃”，避免 Vercel 冷启动，但是带来的两个问题

 **请求次数（invocations）消耗**

Vercel 免费额度为：

- **每月 100 万次函数调用（Serverless）**
- 超过会计费

定时轮询如每 5 分钟一次，就会导致：

- 单点 12 次/小时 × 24 小时 × 30 天 = **8640 次/月**
- 多个函数、多个用户、多个实例 = 快速吃光配额

函数执行时间（执行量）也会被计费

如果你的函数稍微复杂，哪怕执行几十毫秒，也会累计：

- 免费额度每月约 100 小时

定时请求就会偷偷“吞掉”你的一部分执行时间，尤其 NestJS 冷启动时执行逻辑更多

| 方法                              | 描述                                                     | 优点           | 缺点             |
| --------------------------------- | -------------------------------------------------------- | -------------- | ---------------- |
| **只对核心接口做保温**            | 只定时请求关键慢接口（如 `/api/init`）                   | 精准高效       | 控制复杂度增加   |
| **客户端访问时 warm up**          | 用户第一次访问页面时先触发“唤醒 ping”                    | 避免冷请求卡住 | 仍有首次冷启动   |
| **动态监控 + 热度检测保温**       | 判断是否活跃后再保温（需配合 DB）                        | 节省资源       | 实现复杂         |
| **前端 loading UX 遮挡**          | UI 上优化冷启动卡顿体验                                  | 用户体验较好   | 实质没有变快     |
| **Serverless + 常驻服务混合部署** | 把频繁请求放到 Fly.io / Render / Supabase Edge Functions | 高可用         | 成本和复杂度略升 |

**定时 ping API**：

**在前端项目里，用 `setInterval` 每隔几分钟请求一次 API**

**外部定时任务 ping**

| 工具                                 | 地址                                   | 特点                |
| ------------------------------------ | -------------------------------------- | ------------------- |
| [EasyCron](https://www.easycron.com) | 免费支持 HTTP 调用                     | 每 X 分钟 ping 一次 |
| [Cron-job.org](https://cron-job.org) | 免费、支持日志                         | 简单好用            |
| [GitHub Actions](https://github.com) | 自托管 cron（比如每 5 分钟 curl 一次） | 免费但不连续运行    |
| 自己的 VPS                           | 自定义定时任务                         | 自由，但需维护环境  |

如果你部署的是整个 Nest 应用到一个 Serverless 函数（比如 Vercel 的 `/api/index.ts`），那只要你“心跳”其中任意一个接口，就等于整个框架都预热了，其他接口也热了。

Vercel 会根据你项目的 `api/` 目录或 Serverless 入口配置，把每个函数部署为**一个独立的 Serverless 实例**

在 **Vercel 的 Serverless 架构**下，函数被调用时不应该自己“监听端口”（`app.listen()`），而是应该**返回一个“请求处理器”函数**供平台调用。

不要用 `app.listen(...)` 直接监听端口，它适合部署在传统服务器（如 Render/Fly.io），**不适用于 Vercel Serverless**

::: details 示例

```js
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    
    // 添加CORS支持
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // 设置全局前缀（可选）
    // app.setGlobalPrefix('api');

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async (req, res) => {
  const app = await bootstrap();
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance()(req, res);
};
```

:::

**支持本地调试 + Vercel 部署**

```js
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

export async function bootstrap(): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// 如果不是在 Vercel 环境下（即本地运行），就执行监听端口
if (!process.env.VERCEL) {
  bootstrap().then(app => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Local server listening on http://localhost:${port}`);
    });
  });
}

// 如果是 Vercel，则导出 handler
export default async function handler(req, res) {
  const app = await bootstrap();
  const httpAdapter = app.getHttpAdapter();
  return httpAdapter.getInstance()(req, res);
}

```

**使用概览**

| 项目                      | 用量                  | 限额         | 说明                                     |
| ------------------------- | --------------------- | ------------ | ---------------------------------------- |
| Blob Advanced Operations  | 21 / 2000             | 很少用       | 高级 Blob 操作次数，基本没达到瓶颈       |
| Function Invocations      | 240 / 100000          | 只用了 0.24% | Serverless 函数调用次数，远未接近上限    |
| Blob Simple Operations    | 12 / 10000            | 很少用       | 简单 Blob 操作次数                       |
| Edge Requests             | 622 / 1000000         | 极少用       | 边缘请求数（Edge Network）               |
| Fast Data Transfer        | 6.24 MB / 100 GB      | 远未用完     | 快速数据传输流量                         |
| Function Duration         | 0 GB-Hrs / 100 GB-Hrs | 0            | 函数运行时间（貌似没统计？或者很少运行） |
| Fast Origin Transfer      | 274.7 KB / 10 GB      | 很小         | 快速起源传输流量                         |
| Blob Data Transfer        | 5.42 KB / 10 GB       | 很少用       | Blob 数据传输流量                        |
| Blob Data Storage         | 22.52 B / 1 GB        | 极少用       | Blob 存储空间占用非常小                  |
| Edge Request CPU Duration | 0 / 1 h               | 很少用       | CPU 计费时间，未用                       |

