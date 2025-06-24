---
title: 学习和实践Nest.js的一些坑
date: 2025-06-24
category: Note
tags: 
    - Nest.js
    - Node.js
description: Nest.js的学习和实践中常见的一些坑和解决方案
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

# 使用 @nestjs/serve-static 托管静态资源

```ts
imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // 指向 public 目录
      serveRoot: '/', // 静态资源根路径
      exclude: ['*'], // 排除所有路由，只有真实静态资源才会被处理
    }),
    UsersModule,
  ],
```

上述配置防止访问任何不存在的路径都会返回 index.html，默认 ServeStaticModule 会把所有未命中的路由都返回 index.html

# interface & DTO & Entity 的区别

`interface`（类型接口）

- 只是 **开发阶段的类型提示**
- 运行时不会存在，不能做验证、转换
- 不能加装饰器（如 `@IsString()` 等）

💡 用来描述“这个对象应该长什么样”，但不会被 Nest 用来做任何实际的事情。

`DTO`（数据传输对象）

- 是一个 **真实存在的类**
- 会被 `class-validator` 和 `class-transformer` 用来做 **校验 + 转换**
- 常用于 `@Body()`、`@Query()`、`@Param()` 等请求输入

💡 相当于“前端 → 后端”的数据过滤门卫，它可以检查输入是否合法，还能自动转类型。

 `Entity`（实体类）

- 用在 ORM（如 TypeORM、Prisma）中
- 是后端代码和数据库“表”的映射
- 通常用在 `Repository.save()`、`Repository.find()` 这样的数据库操作中

💡 Entity 是数据在后端落地的模型，而 DTO 是数据“进门”之前的检查器。

**关系**：

```text
[interface] ←开发阶段使用（类型提示）

[前端请求]
     ↓
[DTO] ← 校验、过滤、类型转换（transform + validate）
     ↓
[Entity] ← 存入数据库（TypeORM / Prisma）
     ↑
[Entity] → 转换成响应 DTO → 发送给前端
```

**总结**：

- `interface` 是写代码时的“草图”，
-  `DTO` 是请求进门前的“安检员”，
-  `Entity` 是数据库里的“实名登记表”。

