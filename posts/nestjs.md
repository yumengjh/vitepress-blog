---
title: NestJS是一个用于构建高效、可扩展的 Node.js 服务器端应用的框架。
date: 2025-06-13
category: Note
tags: 
    - Node.js
description: Nest (NestJS) 是一个用于构建高效、可扩展的 Node.js 服务器端应用的框架。它使用渐进式 JavaScript，构建并完全支持 TypeScript（但仍然允许开发者使用纯 JavaScript 进行编码）并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数式反应式编程）的元素。
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
aside: false
---

# NestJS

**创建新项目**

```bash
npm i -g @nestjs/cli
```

```bash
nest new project-name
```

| 核心文件                 | 概述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| `app.controller.ts`      | 具有单一路由的基本控制器。                                   |
| `app.controller.spec.ts` | 控制器的单元测试。                                           |
| `app.module.ts`          | 应用的根模块。                                               |
| `app.service.ts`         | 具有单一方法的基本服务。                                     |
| `main.ts`                | 使用核心函数 `NestFactory` 创建 Nest 应用实例的应用入口文件。 |

## 控制器 & 路由

CLI创建控制器：`nest g controller [name]`

控制器的目的是处理应用的特定请求，通常，一个控制器会定义**多个路由**，每个路由都执行不同的操作。

 `@Controller()` 装饰器是定义基本控制器所必需的，可以指定一个可选的路由前缀，比如 "cats"。

 使用 `@Controller()` 装饰器中的路径前缀，有助于将相关的路由组织在一起，避免代码重复。 

```ts {4,6}

import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

`@Get()` HTTP 请求方法装饰器告诉 Nest 为 HTTP 请求的特定端点创建处理程序。

此端点由 HTTP 请求方法和路由路径定义，路由路径则是控制器声明的（可选）前缀与方法装饰器中指定的任何路径相结合来确定

上面代码中，每个路由设置了一个前缀 (`cats`)，并且没有在方法装饰器中添加任何特定路径，因此 Nest 会将 `GET /cats` 请求映射到此处理程序。

**总结**：路由路径包括可选的控制器路径前缀和方法装饰器中指定的任何路径字符串。例如，如果控制器前缀是 `cats` 并且方法装饰器是 `@Get('breed')`，则生成的路由将是 `GET /cats/breed`。

当向此端点触发 GET 请求时，Nest 会将请求路由到用户定义的 `findAll()` 方法，这个方法会返回200状态码以及相关请求。

可以有两种选项操纵响应：

- 标准（推荐）：

  使用此内置方法，当请求处理程序返回 JavaScript 对象或数组时，它将**自动**序列化为 JSON。然而，当它返回 JavaScript 基本类型（例如 `string`、 `number`、 `boolean`）时，Nest 将仅发送该值，而不尝试对其进行序列化。这使得响应处理变得简单：只需返回值，Nest 就会处理剩下的事情。

  默认情况下，响应的**状态代码**始终为 200，但使用 201 的 POST 请求除外。我们可以通过在处理程序级别添加 `@HttpCode(...)` 装饰器来轻松更改此行为

- 库特定

​	我们可以使用特定于库的（例如 Express） [响应对象](https://express.nodejs.cn/en/api.html#res)，它可以使用方法处理程序签名中的 `@Res()` 装饰器注入（例如 `findAll(@Res() response)`）。通过	这种方法，你可以使用该对象公开的原生响应处理方法。例如，使用 Express，你可以使用 `response.status(200).send()` 等代码构建响应。

