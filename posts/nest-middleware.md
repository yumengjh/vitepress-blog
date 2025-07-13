---
title: NestJS 中间件，用于处理请求和响应的函数。
date: 2025-07-11
category: Note
tags: 
    - Nest.js
description: NestJS的中间件，主要用于处理请求和响应的函数，它会在请求到提供程序之前执行。
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

# NestJS 中间件

::: details 目录
[[toc]]
:::

## 中间件{#middleware}

中间件是在路由处理程序之前执行的函数，主要用于拦截请求、记录日志、权限校验、修改请求对象等，必须调用 `next()` 继续执行链条。

中间件函数可以访问 `request` 和 `response` 对象，以及应用请求-响应周期中的 `next()` 函数。	

默认情况下，Nest 中间件等同于 Express 中间件。

```ts
(req, res, next) => { /* 逻辑 */ }
```

官方 Express 文档说明，中间件可以：执行任意代码，修改 req/res，结束请求，或调用 `next()` 继续往下走，如果你不调用 `next()`，请求就“卡死”了，浏览器会一直等待响应。

**函数式中间件**

```ts
function logger(req, res, next) {
  console.log('Request...');
  next();
}
```

**类中间件**：

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Incoming Request to: ${req.method} ${req.url}`);
    next(); // 放行到下一个中间件或控制器
  }
}
```

使用 `@Injectable()` 声明，需要实现 `NestMiddleware` 接口，`use()` 方法中定义逻辑，支持依赖注入（比如你可以注入日志服务）。

需要注意Express 和 Fastify 的差异，如果切换到 Fastify，不要盲目照搬 Express 的中间件

## 依赖注入{#dependency-injection}

Nest 中间件**完全支持依赖注入**，就像 provider 和 controller 一样，它们可以注入**同一模块中注册（可用）的依赖**，和之前一样，这通过 `constructor` 实现。

## 应用中间件{#applying-middleware}

Nest 中间件的注册**不是写在 `@Module()` 装饰器里**，而是通过模块类的 `configure()` 方法，在其中使用 `MiddlewareConsumer` 显式注册。

`@Module()` 装饰器中**没有中间件的位置**，我们使用模块类的 `configure()` 方法注册中间件。

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

`apply()`：传入中间件（可以多个）

`forRoutes()`：指定哪些路由使用中间件（支持字符串、对象、控制器类）

`NestModule`：必须实现这个接口才能使用 `configure()` 方法

**支持更精准地匹配路由和方法**

```ts

import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

只作用于 `GET /cats` 请求，可配合 `RequestMethod.POST / PUT / DELETE` 精确控制

```ts
forRoutes(
  { path: 'cats', method: RequestMethod.GET },
  { path: 'cats', method: RequestMethod.POST }
);
```

你也可以作用于整个控制器类：

```ts
forRoutes(CatsController)
```

 配置方式支持 async，`configure()` 方法可以是异步的。

```ts
async configure(consumer: MiddlewareConsumer) {
  const config = await this.configService.load();
  consumer.apply(MyMiddleware).forRoutes(...);
}
```

虽然不常见，但在某些需要“等待配置完成”后再决定加载哪些中间件的场景中是有用的。

**注意**：如果你使用的是 Express（默认适配器），Nest 会自动注册 `body-parser`。

这意味着：

- Nest 启动时已经注入了 `express.json()` 和 `express.urlencoded()`；
- 如果你想用自己的 JSON 解析器或参数处理中间件，比如：

```ts
app.use(bodyParser.json({ limit: '10mb' }));
```

你必须**在创建应用时关闭 Nest 默认注入的 bodyParser**：

```ts
const app = await NestFactory.create(AppModule, {
  bodyParser: false,
});
```

**推荐中间件注册结构**：

```ts
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, OtherMiddleware)
      .exclude(
        { path: 'cats', method: RequestMethod.POST }, // 不作用于 POST /cats
      )
      .forRoutes(CatsController); // 对 CatsController 所有方法生效
  }
}
```

## 路由通配符{#route-wildcards}

Nest 支持使用路径通配符（如 `*splat`）匹配特定模式的路由，非常适合中间件批量作用于一类路径，比如静态资源、API 前缀、带动态参数的路由等。

```ts
forRoutes({
  path: 'abcd/*splat',
  method: RequestMethod.ALL,
});
```

上面这个配置会匹配：

- `/abcd/1`
- `/abcd/abc`
- `/abcd/anything/here`

`splat` 只是通配符的“名字”，没有任何语义限制，你可以叫它 `*wildcard`、`*pathTail`，任意名称都可以。

**注意**：`path: 'abcd/*'`不会匹配 `/abcd/` 本身，不会匹配 `/abcd/`，因为没有“*”后面的部分。

匹配带或不带尾部的路径：使用 `{*splat}`

```ts
path: 'abcd/{*splat}'
```

这会匹配：

- `/abcd/`
- `/abcd/x`
- `/abcd/x/y`

花括号 `{}` 的意思是：**整个通配符段是可选的**。

**举个实战应用**：

```ts
consumer
  .apply(AuthMiddleware)
  .forRoutes({
    path: 'api/{*wildcard}',
    method: RequestMethod.ALL,
  });
```

上面代码会让中间件作用于所有以 `/api/` 开头的路由，包括 `/api`, `/api/user`, `/api/user/123/edit`。

**建议**：

不推荐用太宽泛的通配符（如 `*`），否则中间件会作用于所有请求，可能带来性能问题。

`path: '{*splat}'` 适合用在全局 fallback 中间件，比如前端 SPA 支持（比如所有非 API 路由跳转到 `index.html`）。

## 中间件消费者{#middleware-consumer}

`MiddlewareConsumer` 是一个中间件管理器，提供链式方法如 `.apply()`、`.forRoutes()`、`.exclude()` 等，用于灵活精确地控制中间件在哪些路由上生效。

`forRoutes()` 接收的参数类型很多样：

| 类型           | 示例                                          | 含义                    |
| -------------- | --------------------------------------------- | ----------------------- |
| 字符串         | `'cats'`                                      | 匹配 `/cats` 路由       |
| 多个字符串     | `'cats', 'dogs'`                              | 匹配多个路径            |
| 控制器类       | `CatsController`                              | 匹配此控制器中所有路由  |
| 多个控制器类   | `CatsController, DogsController`              | 多控制器批量注册        |
| RouteInfo 对象 | `{ path: 'cats', method: RequestMethod.GET }` | 精确指定路径 + 请求方法（支持多个对象） |

 **示例：作用于单个控制器**

```ts
@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

这表示：`LoggerMiddleware` 会**作用于 `CatsController` 的所有方法和路径**。

**提示：apply() 支持多个中间件**

```ts
consumer
  .apply(LoggerMiddleware, AuthMiddleware, CompressionMiddleware)
  .forRoutes(CatsController);
```

你可以一次性注册多个中间件，这些中间件会按顺序依次执行。

| 用法                                               | 建议                                                    |
| -------------------------------------------------- | ------------------------------------------------------- |
| `apply(...).forRoutes('prefix')`                   | 匹配精确的 `/prefix` 路径                               |
| `apply(...).forRoutes(SomeController)`             | 用于作用于整个控制器                                    |
| `apply(...).forRoutes({ path: ..., method: ... })` | 精细控制请求路径和方法                                  |
| `apply(...).exclude(...)`                          | 配合 `exclude()` 排除特定路由（比如某些无需认证的路径） |

`.exclude()` 示例（经典登录绕过场景）：

```ts
consumer
  .apply(AuthMiddleware)
  .exclude({ path: 'auth/login', method: RequestMethod.POST })
  .forRoutes('*');
```

这会让中间件作用于所有路由，**但排除掉** POST `/auth/login`。

## 排除路由{#excluding-routes}

`.exclude()` 方法可以排除特定路由，使中间件不作用于这些路径，适用于**登录白名单、Webhook绕过、安全路由控制**等场景。

`exclude()` 方法接受单个字符串、多个字符串或 `RouteInfo` 对象来标识要排除的路由，`.exclude()` 和 `.forRoutes()` 的参数类型 **基本一致**

比如你想中间件作用于整个控制器，但排除其中一两个方法（如 `/cats` 的 GET、POST）。

```ts
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/{*splat}',
  )
  .forRoutes(CatsController);
```

将 `LoggerMiddleware` 应用于 `CatsController` 的所有路由，**但排除以下路由**：

- `GET /cats`
- `POST /cats`
- 所有 `/cats/xxx` 子路径

`exclude()` 是对 `.forRoutes()` 的补充，它是**优先生效**的：

先执行 `exclude()` 过滤掉你不希望中间件生效的路径，剩下的交给 `forRoutes()` 匹配范围

路径匹配使用的是 [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) 包（Express 也是这个），所以你可以放心使用通配符：`*`、`{*splat}`、参数等

## 功能中间件{#functional-middleware}

如果你的中间件只是做些简单的请求日志、路径检查、IP 过滤等逻辑，没有依赖注入或状态管理，就可以用一个简单的函数来定义，而不需要写一个类。

**👎 基于类的中间件（麻烦）**：

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

**👍 函数式中间件（推荐用于轻量场景）**：

```ts
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('Request...');
  next();
}
```

注册方式一样：

```ts
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

 **函数式中间件的适用场景**：不需要依赖注入，只打印日志、设置 headers、IP 白名单等，没有内部状态，纯逻辑

**不建议使用函数式的情况**：中间件需要注入服务，需要配置项（如读取 configService）， 需要访问模块上下文，但只有类支持依赖注入 & 生命周期

**优雅使用**：

1. 放在 `common/middleware/logger.middleware.ts`
2. 对于中间件名，可以规范命名为 `loggerMiddleware()` 或 `logger`，函数名小写。
3. 有状态的中间件 → 用类；无状态 → 用函数。

**建议**：当你的中间件不需要任何依赖时，请考虑使用更简单的功能中间件替代方案。

## 多个中间件{#multiple-middleware}

为了绑定顺序执行的多个中间件，只需在 `apply()` 方法中提供一个逗号分隔的列表：

```ts
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

它们的执行顺序是：`cors()` -> `helmet()` -> `logger()`，即从左到右依次执行。

**类中间件写类名**：`LoggerMiddleware`

**函数式中间件写函数**：`logger`（不加括号）

**第三方中间件（如 `cors`）写函数调用结果**：`cors()`

**Nest完全兼容 Express 和 Fastify 的中间件生态**，你可以直接使用大量成熟的中间件库

## 常用第三方中间件库{commonly-middleware-libraries}

适用于 Express 适配器：

| 中间件                                                       | 说明                                                 | 安装                          |
| ------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------- |
| [`helmet`](https://www.npmjs.com/package/helmet)             | 设置各种安全 HTTP 头部，防止 XSS、点击劫持等攻击     | `pnpm add helmet`             |
| [`cors`](https://www.npmjs.com/package/cors)                 | 开启跨域资源共享                                     | `pnpm add cors`               |
| [`morgan`](https://www.npmjs.com/package/morgan)             | 请求日志记录器，支持不同格式（如 `combined`、`dev`） | `pnpm add morgan`             |
| [`compression`](https://www.npmjs.com/package/compression)   | Gzip 压缩 HTTP 响应体，提升传输效率                  | `pnpm add compression`        |
| [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit) | 限流中间件，防止接口刷爆                             | `pnpm add express-rate-limit` |
| [`express-session`](https://www.npmjs.com/package/express-session) | 处理 Session 会话管理（配合身份认证）                | `pnpm add express-session`    |
| [`cookie-parser`](https://www.npmjs.com/package/cookie-parser) | 解析 HTTP 请求中的 Cookie                            | `pnpm add cookie-parser`      |
| [`express-useragent`](https://www.npmjs.com/package/express-useragent) | 解析请求头中的 user-agent 字符串                     | `pnpm add express-useragent`  |

在 NestJS 中使用
```ts
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as compression from 'compression';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        helmet(),
        cors(),
        compression(),
        morgan('dev')
      )
      .forRoutes('*');
  }
}
```

如果你切换到 Fastify（`@nestjs/platform-fastify`），则要使用 Fastify 对应的插件：

| 插件                  | 替代 Express 中间件       |
| --------------------- | ------------------------- |
| `@fastify/cors`       | 替代 `cors`               |
| `@fastify/helmet`     | 替代 `helmet`             |
| `@fastify/compress`   | 替代 `compression`        |
| `@fastify/rate-limit` | 替代 `express-rate-limit` |

通过 `app.register(...)` 注册插件，而不是 `consumer.apply(...)`

**建议组合（开发 + 生产）**

| 用途       | 推荐中间件                                   |
| ---------- | -------------------------------------------- |
| 安全       | `helmet()`、`rate-limit()`                   |
| 性能       | `compression()`、Fastify 也推荐              |
| 监控       | `morgan('dev')` + 自定义 logger              |
| 用户端信息 | `express-useragent`                          |
| 身份认证   | `cookie-parser()` + `session()`（配合 Auth） |

## 全局中间件{#global-middleware}

如果我们想一次将中间件绑定到每个已注册的路由，我们可以使用 `INestApplication` 实例提供的 `use()` 方法

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 绑定全局中间件（函数式）
  app.use(logger);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**特点说明**

| 特性           | 说明                                                 |
| -------------- | :--------------------------------------------------- |
| 作用范围       | 绑定到 **所有** 路由                                 |
| 使用方式       | `app.use(...)`                                       |
| 推荐中间件类型 | **函数式中间件**（推荐），也支持类（但不能注入依赖） |
| 注册位置       | 必须在 `main.ts` 中使用 `INestApplication` 实例      |
| 调用时机       | 在所有模块加载完后运行                               |

**注意**：全局中间件**不能使用依赖注入**

类中间件如果通过 `app.use(...)` 注册，是无法注入依赖的！因为它脱离了 Nest 的模块体系。

```ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {} // 不会注入
}
```

所以，**用函数式中间件**（比如纯 logger 函数）放在全局就好， **需要依赖注入的类中间件**不要用 `app.use()` 注册。

**支持依赖注入的“伪全局中间件”**

如果你想要：中间件作用于整个 app（几乎所有路由），又希望能注入依赖（比如 `ConfigService`、`LoggerService`）

```ts
consumer
  .apply(LoggerMiddleware)
  .forRoutes('*'); // 匹配所有路由，包括 Controller 中的所有 handler
```

这种方式中间件能像正常提供器一样注入依赖，还能通过 `exclude()` 精细控制范围。
