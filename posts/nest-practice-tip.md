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

# REST 和 CRUD 的区别

CRUD 是数据库和应用开发中最基础的四种操作，分别是：

- **C**reate —— 创建（新增数据）
- **R**ead —— 读取（查询数据）
- **U**pdate —— 更新（修改数据）
- **D**elete —— 删除（删除数据）

这四个操作涵盖了绝大多数数据的增删改查行为。

REST（Representational State Transfer，表述性状态转移）是一种**设计网络服务的架构风格**，它定义了一套基于 HTTP 协议的标准和原则，用于构建可扩展、可维护的网络 API。

REST 规定：

- 使用 **HTTP 方法** 来操作资源：
  - `POST` 用于创建资源
  - `GET` 用于读取资源
  - `PUT` / `PATCH` 用于更新资源
  - `DELETE` 用于删除资源
- 每个资源都对应一个唯一的 URL（URI）
- 无状态请求（服务器不保存客户端状态）

**REST 和 CRUD 的关系？**

REST API 中的操作往往映射到 CRUD 的操作上。

**CRUD 是操作数据的概念，REST 是通过 HTTP 实现这些操作的设计规范。**

| CRUD 操作 | REST HTTP 方法 | 说明          |
| --------- | -------------- | ------------- |
| Create    | POST           | 创建新资源    |
| Read      | GET            | 查询/读取资源 |
| Update    | PUT / PATCH    | 修改已有资源  |
| Delete    | DELETE         | 删除资源      |

**例子**

| 操作                 | HTTP 请求            | 描述                 |
| -------------------- | -------------------- | -------------------- |
| 创建用户（Create）   | `POST /users`        | 新增用户             |
| 查询所有用户（Read） | `GET /users`         | 获取用户列表         |
| 查询单个用户         | `GET /users/{id}`    | 根据 ID 获取用户详情 |
| 更新用户             | `PUT /users/{id}`    | 修改指定 ID 的用户   |
| 删除用户             | `DELETE /users/{id}` | 删除指定 ID 的用户   |

**总结**：CRUD 是数据操作的抽象概念，REST 是用 HTTP 方法来规范和实现这些操作的架构风格。
