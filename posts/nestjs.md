---
title: NestJS是一个用于构建高效、可扩展的 Node.js 服务器端应用的框架。
date: 2025-06-13
category: Note
tags: 
    - Node.js
    - Nest.js
description: Nest (NestJS) 是一个用于构建高效、可扩展的 Node.js 服务器端应用的框架。它使用渐进式 JavaScript，构建并完全支持 TypeScript（但仍然允许开发者使用纯 JavaScript 进行编码）并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数式反应式编程）的元素。
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
aside: false
---

# NestJS

::: details 目录

[[toc]]

:::

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

## 控制器 & 路由{#controllers-routing}

> 内置 [validation](https://nest.nodejs.cn/techniques/validation) 的 CRUD 控制器：
>
> 指的是基本的增删改查（Create, Read, Update, Delete）操作的控制器时，系统已经内置了数据验证机制。这意味着在处理请求时，数据会自动进行验证，确保符合预定义的规则，比如字段的类型、是否为空、格式等，从而提升系统的健壮性和安全性。

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

  使用此内置方法，**当请求处理程序返回 JavaScript 对象或数组时，它将自动序列化为 JSON**。然而，当它返回 JavaScript 基本类型（例如 `string`、 `number`、 `boolean`）时，Nest 将仅发送该值，而不尝试对其进行序列化。这使得响应处理变得简单：只需返回值，Nest 就会处理剩下的事情。

  默认情况下，响应的**状态代码**始终为 200，但使用 201 的 POST 请求除外。我们可以通过在处理程序级别添加 `@HttpCode(...)` 装饰器来轻松更改此行为

- 库特定

​	我们可以使用特定于库的（例如 Express） [响应对象](https://express.nodejs.cn/en/api.html#res)，它可以使用方法处理程序签名中的 `@Res()` 装饰器注入（例如 `findAll(@Res() response)`）。通过	这种方法，你可以使用该对象公开的原生响应处理方法。例如，使用 Express，你可以使用 `response.status(200).send()` 等代码构建响应。

如果同时使用两种方法，则该单一路由的标准方法将自动禁用，并且将不再按预期工作。要同时使用这两种方法（例如，通过注入响应对象来仅设置 cookies/headers，但仍将其余部分留给框架），你必须在 `@Res({ passthrough: true })` 装饰器中将 `passthrough` 选项设置为 `true`。

```ts
  @Get()
  getCats(@Res({ passthrough: true }) res: Response) {
    res.status(404);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Custom-Header', 'test');
    return {
      name: 'Tom',
      age: 18,
      breed: 'Siamese',
    };
  }
```

## 请求对象{#request-object}

处理程序通常需要访问客户端的请求详细信息，通过 `@Req()` 装饰器注入请求对象来访问请求对象。

```ts {7}
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

> 要利用 `express` 类型（如上面的 `request: Request` 参数示例），请确保安装 `@types/express` 包。

请求对象包含查询字符串、参数、HTTP 标头和正文的属性，完整阅读更多 [Express请求](https://express.nodejs.cn/en/api.html#req)

在大多数情况下，你不需要手动访问这些属性。相反，你可以使用专用装饰器，如 `@Body()` 或 `@Query()`，它们是开箱即用的。

| 装饰器                     | 相应平台特定对象                    |
| -------------------------- | ----------------------------------- |
| `@Request(), @Req()`       | `req`                               |
| `@Response(), @Res()`***** | `res`                               |
| `@Next()`                  | `next`                              |
| `@Session()`               | `req.session`                       |
| `@Param(key?: string)`     | `req.params` / `req.params[key]`    |
| `@Body(key?: string)`      | `req.body` / `req.body[key]`        |
| `@Query(key?: string)`     | `req.query` / `req.query[key]`      |
| `@Headers(name?: string)`  | `req.headers` / `req.headers[name]` |
| `@Ip()`                    | `req.ip`                            |
| `@HostParam()`             | `req.hosts`                         |

当你在处理函数中注入 `@Res()` 或 `@Response()` 时，Nest 将该处理程序置于**库特定模式**（library-specific mode）。在这种模式下，**你需要手动管理响应的发送**，例如使用 `res.json(...)` 或 `res.send(...)`。如果你不这样做，HTTP 请求将会挂起。

但如果你使用 `@Res({ passthrough: true })`，则可以**同时保留标准模式的特性**，即允许你返回一个值，由 Nest 自动处理响应。这种方式在需要访问底层响应对象的同时，仍可使用框架默认的响应流程。

- 使用 `@Res()` 会切换到底层（Express/Fastify）模式
- **必须手动处理响应，否则请求挂起**
- 使用 `{ passthrough: true }` 可以“两全其美”：访问响应对象 + 自动响应

## 资源{#resources}

在 Nest 中有所有标准的 Http 方法都有对应的装饰器：

`@Get()`、`@Post()`、`@Put()`、`@Delete()`、`@Patch()`、`@Options()` 和 `@Head()`。此外，`@All()` 定义了一个端点来处理所有这些。

## 路由通配符{#route-wildcards}

NestJS 也支持基于模式的路由。例如，星号（`*`）可用作通配符，以匹配路径末尾路由中的任意字符组合。

```js
@Get('abcd/*')
findAll() {
  return 'This route uses a wildcard';
}
```

任何以 `abcd/` 开头的路由，都将执行 `findAll()` 方法，无论后面有多少个字符

通配符也可以位于中间，例如 `@Get('abcd/*/efgh')`，这将匹配所有以 `abcd/` 开头并以 `/efgh` 结尾的路径。

## 状态码{#status-code}

可以通过在处理程序级别使用 `@HttpCode(...)` 装饰器轻松更改响应的状态代码，响应的默认状态代码始终为 200，但 POST 请求除外，其默认为 201。

```js
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

需要从 `@nestjs/common` 包中导入 `HttpCode`。

通常，你的状态代码不是静态的，而是取决于各种因素。在这种情况下，你可以使用特定于库的响应（使用 `@Res()` 注入）对象（或者，如果发生错误，则抛出异常）。

::: details 示例

```js
import { Controller, Get, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UserController {
  @Get('check')
  checkUser(@Query('id') id: string, @Res() res: Response) {
    if (!id) {
      // 动态返回 400 Bad Request
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    const userExists = id === '123'; // 模拟查找

    if (userExists) {
      // 动态返回 200 OK
      return res.status(200).json({ message: 'User found', id });
    } else {
      // 动态返回 404 Not Found
      return res.status(404).json({ message: 'User not found' });
    }
  }
}

```

:::

## Req & Res{#req-res}

| 对象              | 作用                                                         |
| ----------------- | ------------------------------------------------------------ |
| `req`（Request）  | 代表客户端发来的请求，例如 headers、body、query、params 等   |
| `res`（Response） | 表示服务器准备发送的响应，调用 `res.send()`、`res.json()` 就是用它来回复 |

**NestJS 的两种响应处理模式**

| 模式                            | 特征                                                         | 适合场景                 |
| ------------------------------- | ------------------------------------------------------------ | ------------------------ |
| **标准模式**（默认）            | 你只需 `return` 数据，Nest 会自动调用 `res.json(...)`        | 推荐使用                 |
| **库特定模式**（使用 `@Res()`） | 你需要自己调用 `res.send()`、`res.json()` 等，否则请求会挂起 | 需要自定义响应行为时使用 |

```js
// 标准模式（自动响应）
@Get('user')
getUser() {
  return { name: 'Alice' }; // Nest 自动 res.json({ ... })
}

// 特定模式 （手动响应）
@Get('user')
getUser(@Res() res: Response) {
  res.json({ name: 'Alice' }); // 你必须手动调用，否则导致“请求挂起”问题
}
```

**混合模式**

```js
@Get('user')
getUser(@Res({ passthrough: true }) res: Response) {
  res.setHeader('X-Custom', 'Nest'); // 你可以设置响应头
  return { name: 'Alice' }; // Nest 会自动调用 res.json(...)
}
// 既可以访问底层对象，又不失去自动响应能力
```

`@Res({ passthrough: true })`的本质是允许你访问底层的响应对象（Express/Fastify），但不阻止 Nest 的自动响应处理机制。

 默认情况下的 `@Res()` 是“全权接管响应”的，当你使用 `@Res()` 时，NestJS 会把响应控制权**交给你**，你必须自己调用 `res.send()` 或 `res.json()`，否则 HTTP 请求会挂起，Nest 不会再帮你做：设置状态码，设置响应头，处理你 `return` 的返回值。

加了 `passthrough: true` 后，NestJS 会保留你访问底层响应对象（`res`）的能力，依然会处理你在函数里 `return` 的返回值，响应仍由 Nest 自动 `.json()` 或 `.send()` 处理，你可以手动设置 headers、cookies 等。

```js
@Get()
getHello(@Res({ passthrough: true }) res: Response) {
  res.setHeader('X-Powered-By', 'NestJS');
  return { message: 'Hello' }; // Nest 会自动 res.json(...)
}
```

## 响应头{#response-headers}

要指定自定义响应标头，你可以使用 `@Header()` 装饰器或库特定的响应对象（并直接调用 `res.header()`）。

需要从 `@nestjs/common` 包中导入 `Header`。

| 方法              | 来源          | 使用方式                                                | 是否链式   | 生命周期控制                          | 推荐场景                   |
| ----------------- | ------------- | ------------------------------------------------------- | ---------- | ------------------------------------- | -------------------------- |
| `res.setHeader()` | Node.js 原生  | `res.setHeader('Cache-Control', 'no-store')`            | ❌ 否       | 最底层，立即设置                      | ✅ 推荐，通用性强           |
| `res.header()`    | Express 封装  | `res.header('Cache-Control', 'no-store')`               | ✅ 支持链式 | 基于 Express 实现                     | ✔ Express 项目中方便好用   |
| `@Header()`       | NestJS 装饰器 | `@Header('Cache-Control', 'no-store')` 放在控制器方法上 | ❌ 否       | Nest 自动设置响应头（在 `return` 前） | ✅ 推荐用于简单设置响应头时 |

`res.header`允许链式调用：

```js
res.header('A', 'x').header('B', 'y').status(200).send()
```

## 重定向{#redirection}

要将响应重定向到特定 URL，你可以使用 `@Redirect()` 装饰器或库特定的响应对象（并直接调用 `res.redirect()`）。

`@Redirect()` 有两个参数，`url` 和 `statusCode`，两者都是可选的。如果省略，`statusCode` 的默认值为 `302` (`Found`)。

```typescript
@Get()
@Redirect('https://nest.nodejs.cn', 301)
```

动态确定 HTTP 状态代码或重定向 URL。通过返回遵循 `HttpRedirectResponse` 接口（来自 `@nestjs/common`）的对象来完成此操作。

```ts
export interface HttpRedirectResponse {
    url: string;
    statusCode: HttpStatus;
}
```

返回值将覆盖传递给 `@Redirect()` 装饰器的任何参数。例如：

```ts
@Get('docs')
@Redirect('https://nest.nodejs.cn', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://nest.nodejs.cn/v5/' };
  }
}
```

## 路由参数{#route-parameters}

当你需要接受动态数据作为请求的一部分时，要定义带有参数的路由，可以在路由路径中添加路由参数标记以从 URL 中捕获动态值。然后可以使用 `@Param()` 装饰器访问这些路由参数，该装饰器应添加到方法签名中。

```ts
@Get(':id')
findOne(@Param() params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

`@Param()` 装饰器用于装饰方法参数（在上面的示例中为 `params`），使路由参数可作为方法内部该装饰方法参数的属性访问。如代码所示，你可以通过引用 `params.id` 来访问 `id` 参数。或者，你可以将特定的参数标记传递给装饰器，并在方法主体中直接按名称引用路由参数。

> 从 `@nestjs/common` 包中导入 `Param`。

```ts

@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}
```

## 子域路由{#sub-domain-routing}

`@Controller` 装饰器可以采用 `host` 选项来要求传入请求的 HTTP 主机匹配某个特定值。

```ts
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

与路由 `path` 类似，`host` 选项可以使用标记来捕获主机名中该位置的动态值。下面 `@Controller()` 装饰器示例中的主机参数令牌演示了这种用法。可以使用 `@HostParam()` 装饰器访问以这种方式声明的主机参数，应将其添加到方法签名中。

```ts
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

## 状态共享{#state-sharing}

相关文章：[单例模式和请求级作用域](./singletons-isolation)
