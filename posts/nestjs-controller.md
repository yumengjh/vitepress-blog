---
title: NestJS 控制器，负责处理传入的请求并将响应发送回客户端
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
AutoAnchor: true
aside: false
---

# NestJS 控制器

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

## 异步性{#asynchronicity}

每个 `async` 函数都必须返回一个 `Promise`，Nest 会自动等待它完成（等待这个异步任务完成后再响应请求）。

```js
 @Get('a3')
  async getData(): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve('服务器延迟1秒返回'), 1000);
    });
  }
```

**强调 async 函数返回 Promise**

它基于 **异步函数的自动等待机制**，你就可以：

- 用 `await` 写异步数据库、网络请求等逻辑；
- 返回的 `Promise` 会被 Nest **自动“解析”（await）**，响应才会发送出去；
- 你不需要自己 `.then()` 或写复杂回调。

Nest 不仅支持 `async/await` 写法，还支持把路由方法直接返回一个 **RxJS 的可观察对象（Observable）**。

Nest 会在内部自动订阅这个 Observable，等它返回值后再发送响应。

**RxJS** 是一个处理异步流的库，核心概念是 **Observable**（可观察对象）。

可以把 `Observable` 类比成：

- 一个 **可以持续发出数据的“异步数据流”**（不像 Promise 只能发一次）；
- 它就像一个“事件发布者”，你可以“订阅”它；
- Nest 支持它，是因为很多场景需要**响应式数据流处理**（比如 WebSocket、消息队列、流式文件、连续事件）。

**对比 Promise 和 Observable**

| 特性         | `Promise`            | `Observable`（RxJS）                |
| ------------ | -------------------- | ----------------------------------- |
| 触发次数     | 只能触发一次         | 可以触发多次                        |
| 是否可取消   | 不可取消             | 可取消（unsubscribe）               |
| 支持组合操作 | 较弱（靠 then 链式） | 强大（map、filter、merge 等操作符） |
| 常用于       | 单次异步请求（HTTP） | 多次/流式异步任务（事件流、数据流） |

```ts
import { Controller, Get } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Controller('users')
export class UsersController {
  @Get()
  findAll(): Observable<any[]> {
    return of([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
    ]);
  }
}
```

`of(...)` 是 RxJS 提供的一个函数，它返回一个 Observable，里面的内容是你给的数据数组

Nest 检测到你返回的是 Observable，会自动 `.subscribe()` 它，然后把最终数据作为 HTTP 响应返回；

效果跟你写 `async findAll(): Promise<...>` 是一样的。

## 请求负载{#request-payloads}

在使用POST 路由处理程序时，通过添加 `@Body()` 装饰器来接受客户端参数。

> DTO 是一个指定如何通过网络发送数据的对象。

参数的类型需要使用DTO数据传输对象模式，可以使用 TypeScript 接口或简单类来定义 DTO 模式。

建议在此处使用类。而不是 `interface`，因为 class 在编译后仍然存在于运行时，可以被 Nest 用来做校验、转换、依赖注入等高级功能。

```ts
import { IsString, IsInt } from 'class-validator';

// DTO
export class CreateCatDto {
  @IsString() name: string;
  @IsInt() age: number;
  @IsString() breed: string;
}
// 使用DTO
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

Nest 的 `ValidationPipe` 可以过滤掉方法处理程序不应接收的属性，将可接受的属性列入白名单，并且白名单中未包含的任何属性都会自动从生成的对象中删除。在 `CreateCatDto` 示例中，我们的白名单是 `name`、`age` 和 `breed` 属性。了解更多 [ValidationPipe（验证管道）](https://nest.nodejs.cn/techniques/validation#stripping-properties)。

**ValidationPipe**：

```bash
pnpm add class-validator class-transformer	# 如果没有
```

- class-validator 用于 DTO 的属性校验。

- class-transformer 用于对象转换和自动过滤属性。

这两个包是 NestJS DTO 校验的标准依赖，必须一起安装。

**自动删除非白名单的属性**：

自动删除那些在验证类中没有任何装饰器（如 `@IsString()`、`@IsInt()` 等）标记的属性，需要将 `whitelist` 设置为 `true`。

```ts
whitelist: true
```

**存在非白名单属性时终止请求**：

如果请求中包含未在 DTO 中定义或未被装饰器标记的属性，想要直接抛出错误（而不是静默删除），需同时启用：

```ts
whitelist: true,
forbidNonWhitelisted: true
```

 **启用请求数据类型转换**：

若希望将客户端发送的数据（如字符串）自动转换为目标 DTO 中声明的类型（装饰器）（如 `number`、`boolean` 等），需启用：

```ts
transform: true
```

**启用隐式类型转换**（配合 `transform`）：

默认情况下，`class-transformer` 只会转换**显式用 `@Type(() => Type)` 装饰器声明的属性**。
若希望根据 DTO 中的类型推断，自动将字符串转换为 `number`、`boolean` 等，需启用：

```ts
transformOptions: {
  enableImplicitConversion: true
}
```

启用该选项后，**即使未使用 `@Type()` 装饰器**，也会自动根据类型进行转换。
例如：`{ age: "18" }` 会被转换为 `age: 18`，前提是 `age` 在类中被定义为 `number` 类型。

**示例配置**：

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

**扩展**：

如果担心传入值不是一个对象（例如传进来是 `null`、数组、字符串等非对象），可以再加：

```ts
forbidUnknownValues: true
```

Nest 默认是关闭这个的，但在安全场景下你可以启用。

建议在DTO 中字段加 `@Type(() => Number)` ， 显式转换

**尽管开启了 `enableImplicitConversion`，**但在某些复杂结构（如嵌套对象、数组）中，它可能不会自动转换成功**，这时推荐：**

```ts
import { Type } from 'class-transformer';

export class CreateCatDto {
  @Type(() => Number)
  @IsInt()
  age: number;
}
```

显式比隐式更保险，特别是嵌套数组、嵌套对象。

对嵌套对象/数组开启自动验证 `@ValidateNested()` ，否则嵌套对象不会自动校验。

```ts
export class CreateOwnerDto {
  @ValidateNested()
  @Type(() => CreateCatDto)
  cat: CreateCatDto;
}
```

## 查询参数{#query-parameters}

在处理路由中的查询参数时，可以使用 `@Query()` 装饰器从传入请求中提取它们。

```ts
@Get('a6')
demo6(@Query('name') name: string, @Query('age') age: number) {
    return `你的姓名是${name}，年龄是${age}`
}
```

`@Query()` 装饰器用于从查询字符串中提取对应的值

```http
GET /test?name=bill&age=17
```

如果你的应用需要处理更复杂的查询参数，比如：

```http
?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
```

实际值：

`filter` 是一个嵌套对象，像这样：

```js
filter = {
  where: {
    name: 'John',
    age: 30
  }
}
```

`item[]` 是一个数组，等价于 `item = [1, 2]`

Nest 默认的查询参数解析器（基于 Express 或 Fastify）不支持这种复杂结构，如果你直接用默认设置，Nest 无法正确解析这些嵌套对象和数组，它们只会被当成普通字符串处理。

此时需要**配置查询字符串解析器**，让它支持嵌套结构：

如果你用的是 Express（Nest 默认用它）

```ts
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.set('query parser', 'extended');
```

这样 Express 会用内置的“extended”模式解析器（其实就是依赖 `qs` 库），支持嵌套对象和数组。

如果你用的是 Fastify（另一个更快的框架）

```ts
import qs from 'qs'; // 确保安装：npm install qs

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    querystringParser: (str) => qs.parse(str),
  }),
);
```

> [`qs`](https://www.npmjs.com/package/qs) 是一个功能强大的查询字符串解析库，可以将嵌套结构、数组等复杂参数从 URL 字符串转换为 JS 对象，安装 `npm install qs`

## 处理错误{#handling-errors}

Nest 带有一个内置的异常层，负责处理应用中所有未处理的异常。当你的应用代码未处理异常时，该层会捕获该异常，然后自动发送适当的用户友好响应，此操作由内置的全局异常过滤器执行，该过滤器处理 `HttpException` 类型（及其子类）的异常。当异常无法识别时（既不是 `HttpException` 也不是继承自 `HttpException` 的类），内置异常过滤器会生成以下默认 JSON 响应：

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

> NestJS 的全局异常过滤器**部分支持 [`http-errors`](https://github.com/jshttp/http-errors) 这个第三方库**。
> 只要你抛出的错误对象里**包含 `statusCode` 和 `message` 这两个字段**，Nest 就能识别它，并把它作为一个“合法的 HTTP 异常”返回给前端。
>
> 也就是说：**你不一定非得抛 Nest 的 `HttpException`**，只要抛出一个结构像这样的对象：
>
> ```js
> throw { statusCode: 404, message: 'Not Found' };
> ```
>
> NestJS 就会把它当成正常的 HTTP 响应，而**不会默认变成 500 服务器错误（InternalServerError）**
>
> ```js
> // 例子
> import createError from 'http-errors';
> 
> @Get()
> getSomething() {
>   throw createError(403, '你无权访问该资源');
> }
> ```
>
> Nest 能识别这个异常，并返回：
>
> ```json
> {
>   "statusCode": 403,
>   "message": "你无权访问该资源"
> }
> 
> ```
>
> 你可以不用写 `new HttpException()`，只要你抛出的对象里带有 `statusCode` 和 `message`，Nest 也能当成合法异常来处理和响应。
>
> 对于使用 `http-errors`、`Boom` 等库的人来说非常方便

**抛出标准异常**

Nest 提供了一个内置的 `HttpException` 类，位于 `@nestjs/common` 包中。对于典型的基于 HTTP REST 或 GraphQL 的应用来说，最佳实践是在遇到错误时，发送标准的 HTTP 响应给客户端，以明确表示错误状态；

也就是说：当你的接口出错时，不要直接抛出普通错误，而是用 Nest 提供的 `HttpException`，让服务器能返回符合 HTTP 规范的错误状态码和信息，方便客户端处理。

```ts
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

> `HttpStatus`是一个从 `@nestjs/common` 包导入的辅助枚举。

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

`HttpException` 构造函数接收两个必选参数来决定响应内容：

- `response` 参数定义了 JSON 响应体，可以是如下所述的 `string` 或 `object` 类型。
- `status` 参数定义了 [HTTP 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)

默认情况下，JSON 响应体包含两个属性：

- `statusCode`：默认为 `status` 参数中提供的 HTTP 状态码
- `message`：基于 `status` 的 HTTP 错误简短描述

若要仅覆盖 JSON 响应体中的消息部分，请在 `response` 参数中传入字符串。若要覆盖整个 JSON 响应体，则在 `response` 参数中传入对象。Nest 会将该对象序列化后作为 JSON 响应体返回。

第二个构造参数 `status` 应为有效的 HTTP 状态码。最佳实践是使用从 `@nestjs/common` 导入的 `HttpStatus` 枚举。

`HttpException` 的 **第三个参数 `options`（通常用于 `cause`）** 是为了提供**额外上下文信息**，**不会被序列化进响应体**，仅用于日志、调试或内部传递。

```js
throw new HttpException(
  '用户不存在',
  HttpStatus.NOT_FOUND,
  {
    cause: new Error('User ID 123 not found in database')
  }
);
```

实际客户端收到的响应是

```json
{
  "statusCode": 404,
  "message": "用户不存在"
}
```

但在服务端你可以通过 `exception.cause` 拿到更多信息。

**异常日志记录**

在 NestJS 中，**默认情况下，异常过滤器不会记录内置异常**，比如：

- `HttpException`（以及继承自它的自定义异常）
- `WsException`（WebSocket 异常）
- `RpcException`（微服务异常）

当这类异常被抛出时，它们不会在控制台中自动打印日志。原因是：

**它们被视为“正常的应用流程”**，就像 HTTP 中 404 或 403 是可预期的，不属于程序出错。

异常基础类：`IntrinsicException`，这些内置异常都继承自一个基础类：`IntrinsicException`，它来自 `@nestjs/common` 包。

这个类的存在是为了帮助框架区分：

✅ **正常业务流程中的异常**（如访问受限、参数不合法）

❌ **非预期的程序错误**（如数据库连接失败、空指针）

如果你想记录这些异常，可以通过**编写自定义异常过滤器（Exception Filter）**，你可以在其中手动记录、格式化或扩展这些异常。

**自定义异常类**

主要用于**封装常见的状态和逻辑，避免重复代码**

不用每次都写这一堆：

```js
throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
```

可以直接写：

```js
throw new ForbiddenException();
```

更短、更语义化、可读性更强。

形成统一的异常体系（更易维护），比如有这些错误：

- 用户未登录 → `UnauthorizedException`
- 用户被封禁 → `UserBannedException`
- 参数错误 → `InvalidParamException`

用自定义异常封装后，代码里就很清晰，异常层次也清楚，**以后要统一处理（日志记录、响应格式）非常方便。**

自定义响应结构：错误码、语言、元数据等

```js
export class UserBannedException extends HttpException {
  constructor(reason = '你已被封号') {
    super(
      { message: reason, errorCode: 1004 },
      HttpStatus.FORBIDDEN,
    );
  }
}
```

返回前端的内容更有业务含义：

```json
{
  "message": "你已被封号",
  "errorCode": 1004,
  "statusCode": 403
}
```

**便于在异常过滤器中按类型分类处理**

```js
if (exception instanceof UserBannedException) {
  logger.warn('用户封禁：' + exception.message);
}	
```

自定义异常类的核心作用就是：**把常用的异常信息封装成可复用的“状态类”**，
让你在抛异常时不用重复写、结构统一、可读性高、易于后期扩展。

**内置 HTTP 异常**

Nest 提供了一组继承自基础 `HttpException` 的标准异常。这些异常来自 `@nestjs/common` 包，代表了许多最常见的 HTTP 异常：

| 异常类名称                         | 对应 HTTP 状态码 | 描述                       |
| ---------------------------------- | ---------------- | -------------------------- |
| `BadRequestException`              | 400              | 请求无效（参数错误等）     |
| `UnauthorizedException`            | 401              | 未授权/未登录              |
| `ForbiddenException`               | 403              | 已登录但无权限             |
| `NotFoundException`                | 404              | 资源未找到                 |
| `MethodNotAllowedException`        | 405              | 不支持的请求方法           |
| `NotAcceptableException`           | 406              | 服务端无法满足请求头的需求 |
| `RequestTimeoutException`          | 408              | 请求超时                   |
| `ConflictException`                | 409              | 资源冲突（如用户名已存在） |
| `GoneException`                    | 410              | 资源已被永久删除           |
| `PayloadTooLargeException`         | 413              | 请求体太大                 |
| `UnsupportedMediaTypeException`    | 415              | 不支持的请求内容类型       |
| `UnprocessableEntityException`     | 422              | 请求格式正确但语义错误     |
| `PreconditionFailedException`      | 412              | 请求头条件不满足           |
| `InternalServerErrorException`     | 500              | 服务端内部错误             |
| `NotImplementedException`          | 501              | 功能未实现                 |
| `BadGatewayException`              | 502              | 网关错误                   |
| `ServiceUnavailableException`      | 503              | 服务不可用                 |
| `GatewayTimeoutException`          | 504              | 网关超时                   |
| `HttpVersionNotSupportedException` | 505              | 不支持的 HTTP 协议版本     |
| `ImATeapotException`               | 418              | 🍵 I'm a teapot（彩蛋用）   |

所有内置异常还可以通过 `options` 参数提供错误 `cause` 和错误描述：

```ts
new NotFoundException('用户不存在', { cause: new Error('DB lookup failed') });
```

| 参数名     | 类型              | 作用                                     |
| ---------- | ----------------- | ---------------------------------------- |
| `response` | `string | object` | 自定义返回消息体（message 字符串或对象） |
| `options`  | `{ cause?: any }` | 提供内部异常详情（不会返回给前端）       |

> 在**真实开发和日志追踪场景**中，建议总是使用 `new Error(...)`，它提供堆栈信息，对排错非常有帮助。

`HttpException` 构造函数标准（TypeScript 类型定义）：

```ts
class HttpException extends Error {
  constructor(
    response: string | Record<string, any>,
    status: number,
    options?: {
      cause?: unknown;
      description?: string;
    }
  );
}
```

| 参数名     | 类型                                        | 是否必须 | 说明                                                         |
| ---------- | ------------------------------------------- | -------- | ------------------------------------------------------------ |
| `response` | `string` or `object`                        | ✅ 必需   | 响应体，可以是字符串（作为 message）或对象（完整结构）       |
| `status`   | `number`                                    | ✅ 必需   | HTTP 状态码（推荐用 `HttpStatus.X` 枚举）                    |
| `options`  | `{ cause?: unknown, description?: string }` | ❌ 可选   | 附加信息。不会影响响应结构中的 `message`，但会影响 `error` 字段和日志记录 |

```ts
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

// 返回

{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}
```

**异常过滤器**

虽然内置异常过滤器能自动处理多数场景，但在需要**完全控制**异常处理时（如动态日志记录或自定义 JSON 响应结构），应使用异常过滤器。它允许精确控制执行流程和客户端响应内容。

让我们创建一个异常过滤器，负责捕获 `HttpException` 类的实例异常，并为它们实现自定义响应逻辑。为此，我们需要访问底层平台的 `Request` 和 `Response` 对象。我们将访问 `Request` 对象以提取原始 `url` 并将其包含在日志信息中。我们将使用 `Response` 对象通过 `response.json()` 方法直接控制发送的响应。

```ts
@@filename(http-exception.filter)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

 所有异常过滤器都应该实现泛型接口 `ExceptionFilter<T>`，这意味着你需要提供一个具有特定签名的 `catch(exception: T, host: ArgumentsHost)` 方法，  其中，`T` 代表你想要捕获的异常类型。

`ExceptionFilter`的底层：

```ts
export interface ExceptionFilter<T = any> {
    catch(exception: T, host: ArgumentsHost): any;
}
```

所以要这样：

```ts
export class MyFilter implements ExceptionFilter<HttpException> {
  catch(exception, host: ArgumentsHost) {
    // ...
  }
}
```

> 如果您使用 `@nestjs/platform-fastify`，可以用 `response.send()` 替代 `response.json()`。别忘了从 `fastify` 导入正确的类型。

`@Catch()` 装饰器
指定要捕获的异常类型（支持多参数，如 `@Catch(HttpException, CustomError)`）

**参数 host**

`catch()` 方法的两个参数：

- `exception`：就是当前捕获到的异常对象。
- `host`：是一个 `ArgumentsHost` 实例，它是 Nest 提供的一个强大工具。

可以通过 `ArgumentsHost` 获取原始的请求处理相关对象，比如 HTTP 请求时的 `Request` 和 `Response`，这在异常过滤器中非常有用。

我们使用了 `ArgumentsHost` 提供的辅助方法，比如：

```ts
host.switchToHttp().getRequest();
host.switchToHttp().getResponse();
```

**平台抽象访问**：

```ts
const ctx = host.switchToHttp();
// 类型参数<Request>确保TS类型安全
const request = ctx.getRequest<Request>();  // 底层框架的Request对象
const response = ctx.getResponse<Response>(); // 底层框架的Response对象
```

**响应控制**

直接操作平台原生响应对象，完全自定义JSON结构

```ts
response.status(status).json({...});
```

**异常元数据提取**

```ts
exception.getStatus();  // 获取HTTP状态码
exception.message;     // 获取原始错误消息
```

用来获取当前发生异常的请求（request）和响应（response）对象。

为什么要用 `ArgumentsHost` 这种“**间接**”的方式而不是直接传请求？

这是为了让异常过滤器能兼容 **所有上下文类型**，不仅仅是 HTTP 请求。比如：

- **HTTP 模式**
- **WebSocket**
- **微服务（gRPC、MQ 等）**

通过 `ArgumentsHost`，我们可以编写一个 **通用的异常过滤器**，适配不同场景，不必为每个场景写一份过滤逻辑。

`ArgumentsHost` 是一个抽象的上下文容器，让我们能从中获取当前请求上下文中的各种原始对象。它的设计是为了支持多种通信协议，而不仅仅是 HTTP。通过它我们可以写出高度复用的通用异常过滤器。

`ArgumentsHost` 提供访问当前执行上下文的方法：

```ts
const httpCtx = host.switchToHttp(); // HTTP上下文
const rpcCtx = host.switchToRpc();   // 微服务上下文
const wsCtx = host.switchToWs();     // WebSocket上下文
```

**绑定过滤器**

`@UseFilters()` 装饰器是从 `@nestjs/common` 包中导入的。

`@UseFilters()` 装饰器，它的作用是将一个（或多个）异常过滤器应用到某个控制器或具体路由方法上。

它的用法与 `@Catch()` 装饰器类似，区别是：

- `@Catch()` 是**定义**过滤器时使用的（绑定异常类型）；
- `@UseFilters()` 是**应用**过滤器时使用的（告诉 Nest：出错时用哪个过滤器）。

在 `@UseFilters()` 中可以：

- 传入一个过滤器的**实例**（`new HttpExceptionFilter()`）；
- 或者直接传入过滤器**类**（`HttpExceptionFilter`）——这样 Nest 会自动帮你实例化，并支持依赖注入。

 推荐使用“类”的方式（即不加 `new`），这样更符合 Nest 的依赖注入机制，也更易维护。

> 关于直接传入一个类支持依赖注入：
>
> 当你传入的是一个**类（Class）**而不是**实例（new 出来的对象）**时，Nest 会：
>
> - **自动实例化**这个类
> - 如果这个类的构造函数依赖了其他服务，Nest 会**自动注入这些依赖**
> - Nest 还可以自动管理它的**生命周期**（比如是单例、每个请求一个等）
>
>  所以，传类的方式才叫 “**支持依赖注入**”。
>
> 如果是 `@UseFilters(new HttpExceptionFilter())` **自己创建了一个实例**，Nest 完全没机会帮你：
>
> - 注入构造函数里可能需要的依赖服务
> - 管理这个实例的生命周期（比如按作用域缓存、销毁）
> - 做一些内部的注册工作

尽量使用**类名**来注册过滤器，而不是手动 `new` 一个过滤器实例。这样可以**减少内存开销**，因为 Nest 能够对这个类的实例进行**复用和托管**，在同一个模块中避免重复创建多个实例。

**@Catch() 装饰器也推荐传入类**，而不是实例，这与 `@UseFilters()` 的最佳实践一致。

```ts
@UseFilters(HttpExceptionFilter) // ✅ 推荐
@UseFilters(new HttpExceptionFilter()) // ❌ 不推荐
```

**降低内存消耗**：

- 如果你 `new`，每次用一次就创建一个新的对象，造成**重复实例**。
- 如果你交给 Nest 管理，它只会创建**一个共享实例（单例）**（默认是 `Scope.DEFAULT`），多个控制器或方法可共用，**节省资源**。

**Nest 可以轻松复用相同类的实例**

- Nest 有自己的 DI 容器，它会**缓存**已经创建好的单例。
- 如果你用类名注册，Nest 会复用已有的。
- 你手动 new，它就绕开了这个机制，相当于绕过了 DI 系统。

```ts
// 路由级注册
@Get(':id')
@UseFilters(CustomExceptionFilter) 
async getUser(@Param('id') id: string) {
    // 当该路由抛出HttpException时触发CustomExceptionFilter
}

// 控制器级别注册
@UseFilters(new CustomExceptionFilter())
@Controller('users')
export class UsersController {}

// 全局注册（main.ts）
app.useGlobalFilters(new CustomExceptionFilter());
```

NestJS 支持多种类型的应用上下文（执行环境）：

| 应用类型      | 举例                           |
| ------------- | ------------------------------ |
| **HTTP**      | REST 接口                      |
| **WebSocket** | 实时聊天、通知等               |
| **GraphQL**   | 使用 GraphQL API 的应用        |
| **混合应用**  | 同时用 HTTP + WebSocket 的应用 |

`app.useGlobalFilters()` **只会对 HTTP 请求生效**，**不会作用于 WebSocket 网关、GraphQL、或混合类型的应用上下文**，也就是它**只会应用在 HTTP 上下文中**（也就是控制器 Controller 的异常处理中生效）。

如果你还想让它对 WebSocket 生效，你必须在**WebSocket 网关类中单独设置过滤器**。

```ts
@WebSocketGateway()
@UseFilters(new YourExceptionFilter()) // 👈 必须在这里用
export class YourGateway {
  // ...
}
```

**全局作用域的异常过滤器**会影响整个应用，它会自动处理所有控制器和路由里的异常，不用你每个地方都加 `@UseFilters()`。

有时候你注册的全局过滤器不能用依赖注入！当你这样写时 ↓

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new HttpExceptionFilter());
```

这段代码虽然设置了全局过滤器，但你是用 `new` 手动创建的 `HttpExceptionFilter` 实例，Nest **无法给它自动注入依赖**（比如 Logger、服务、配置等）。因为它是在模块系统之外创建的。

解决方案：通过 `APP_FILTER` 令牌注册过滤器

```ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

意思是：让 Nest 来负责创建这个过滤器实例，并自动注入它依赖的服务。这个方式更“优雅”、更官方推荐。

注册位置的建议：你可以在**任何模块中注册这个 APP_FILTER**，它都会变成**全局生效**的。 但**更推荐在定义该过滤器的模块里注册**，这样结构更清晰，也符合模块职责划分。

总结：想让全局异常过滤器也能用依赖注入，就不要用 `new`，而是用 `APP_FILTER + useClass` 的方式，在模块的 `providers` 中注册。

> **自动依赖注入** 在 **异常过滤器（ExceptionFilter）** 中的实际应用：
>
> 你想在出现异常时，把错误写到一个日志服务里，而这个服务是你自己封装的，比如 `LoggerService`。
>
> 步骤 1：创建一个 LoggerService
>
> ```ts
> // logger.service.ts
> import { Injectable } from '@nestjs/common';
> 
> @Injectable()
> export class LoggerService {
>   logError(message: string) {
>     // 这里简化为控制台打印，实际可以写入文件/数据库/第三方日志平台
>     console.error('[LoggerService]', message);
>   }
> }
> ```
>
> 步骤 2：创建一个全局异常过滤器，注入 LoggerService
>
> ```ts
> // filters/http-exception.filter.ts
> import {
>   ExceptionFilter,
>   Catch,
>   ArgumentsHost,
>   HttpException,
>   HttpStatus,
> } from '@nestjs/common';
> import { Request, Response } from 'express';
> import { LoggerService } from '../logger.service';
> 
> @Catch()
> export class HttpExceptionFilter implements ExceptionFilter {
>   constructor(private readonly logger: LoggerService) {} // 👈 自动注入
> 
>   catch(exception: unknown, host: ArgumentsHost) {
>     const ctx = host.switchToHttp();
>     const response = ctx.getResponse<Response>();
>     const request = ctx.getRequest<Request>();
> 
>     const status =
>       exception instanceof HttpException
>         ? exception.getStatus()
>         : HttpStatus.INTERNAL_SERVER_ERROR;
> 
>     const message =
>       exception instanceof HttpException
>         ? exception.message
>         : 'Internal server error';
> 
>     // ✅ 使用自动注入的服务来记录错误
>     this.logger.logError(`[${request.method}] ${request.url} -> ${message}`);
> 
>     response.status(status).json({
>       statusCode: status,
>       message,
>       path: request.url,
>       timestamp: new Date().toISOString(),
>     });
>   }
> }
> ```
>
> 步骤 3：在模块中注册为全局过滤器（启用自动注入）
>
> ```ts
> // app.module.ts
> import { Module } from '@nestjs/common';
> import { APP_FILTER } from '@nestjs/core';
> import { LoggerService } from './logger.service';
> import { HttpExceptionFilter } from './filters/http-exception.filter';
> 
> @Module({
>   providers: [
>     LoggerService,
>     {
>       provide: APP_FILTER,
>       useClass: HttpExceptionFilter, // 👈 不是用 new，而是交给 Nest 生成
>     },
>   ],
> })
> export class AppModule {}
> ```
>
> 什么是“自动依赖注入”？
>
> 你只需要在构造函数中声明 `constructor(private logger: LoggerService)`，Nest 就会**自动帮你创建实例并注入依赖**。
>
> 你不需要 `new LoggerService()`，Nest 的 IoC 容器会识别依赖并自动提供。
>
> 如果你在 `main.ts` 用 `new HttpExceptionFilter()` 的方式，那 Nest 就**无法注入 LoggerService**，你必须自己传进去，那就麻烦多了。

您可以根据需要使用此技术添加任意数量的过滤器，只需将每个过滤器添加到 providers 数组中即可。

**捕获所有异常**

为了捕获**每一个**未处理的异常（无论异常类型如何），只需让 `@Catch()` 装饰器的参数列表为空即可，例如 `@Catch()`。

**通用平台（Express/Fastify）写法**：

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // 有些时候 HttpAdapter 可能在构造函数中还不可用，为了稳妥可以在这里取
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

- `HttpAdapterHost` 是 Nest 抽象出来的 HTTP 平台适配器（比如底层用的是 Express、Fastify 还是其他都不影响）。
- `httpAdapter.getRequestUrl()` 获取请求路径。
- `httpAdapter.reply()` 是平台无关的响应方法，能跨 Express/Fastify 使用。
- 所以这段代码是**跨平台通用**的异常处理器。

**注意**：当你在项目既使用特定异常过滤器（比如只处理 BadRequest）又使用捕获全部的过滤器时，必须先声明捕获全部的过滤器。否则特定类型的异常就被它拦截走了，导致你自定义的特定逻辑无效。

**之前例子的写法是特定于 Express 的，而现在这个例子是“平台无关”的通用写法**。

 区别总结：

| 方面     | Express 专用               | 平台无关（推荐）         |
| -------- | -------------------------- | ------------------------ |
| 使用对象 | `Request` / `Response`     | `HttpAdapterHost`        |
| 响应方式 | `response.status().json()` | `httpAdapter.reply()`    |
| 兼容性   | 只能用于 Express 项目      | 支持 Express、Fastify 等 |
| 灵活性   | 较低，依赖具体平台 API     | 高，可切换底层框架       |
| 是否推荐 | 小项目可以用               | **中大型项目更推荐**     |

Express 专用写法（之前的）：

```ts
const response = ctx.getResponse<Response>();
response.status(status).json({ ... });
```

只能用在 `Express` 项目中，换成 `Fastify` 项目就报错。

平台无关写法：

```ts
const { httpAdapter } = this.httpAdapterHost;
httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
```

无论你 Nest 项目的底层是 Express、Fastify，甚至未来别的 HTTP 引擎，它都能工作正常，**真正做到框架解耦、灵活切换**。

**继承**

通常情况下，您会编写完全自定义的异常过滤器来满足应用需求。但在某些场景，您可能想基于 Nest 内置的全局异常过滤器来做一些定制，比如覆盖某些默认行为。

实现方式是继承 Nest 核心提供的 `BaseExceptionFilter` 类，并在自己的过滤器中调用父类的 `catch()` 方法，将异常处理流程委托给基础实现：

```ts
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

**注意**：继承自 `BaseExceptionFilter` 的方法级或控制器级过滤器，**不要用 `new` 手动实例化**，应由 Nest 框架自动管理实例化，以保证依赖注入和生命周期正确。

全局异常过滤器可以继承这个基础过滤器，有两种常见的应用方式：

直接实例化并传入 `HttpAdapter` 引用：

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

这里自己 new 了过滤器实例，并传入了底层的 `httpAdapter`，用于实现跨平台（Express、Fastify等）的响应操作。

通过依赖注入令牌 `APP_FILTER` 注册：

```ts
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

这种方式让 Nest 自动实例化并注入依赖，适合依赖注入管理更完善的情况。

总结：

- 继承 `BaseExceptionFilter` 能直接复用 Nest 的默认异常处理逻辑，方便定制。
- 方法级或控制器级的继承过滤器不要自己 new，而是让框架管理实例。
- 全局异常过滤器既可以手动 new 并传入适配器，也可以用 `APP_FILTER` 令牌自动注入。

如果你的全局异常过滤器都是自己写的完全定制逻辑，那么**传入并继承 `BaseExceptionFilter` 的意义主要在于重用 Nest 内置的异常处理机制**，具体体现在：

1. **复用框架默认的异常处理行为**
    Nest 内置的 `BaseExceptionFilter` 已经实现了对 `HttpException` 等常见异常的标准处理（比如自动设置状态码、格式化响应等），并且支持跨平台适配（Express、Fastify等）。继承它可以避免你从零开始重写这套逻辑。
2. **保持跨平台兼容性**
    `BaseExceptionFilter` 使用了 `HttpAdapter` 来发送响应，这样你的过滤器在不同底层 HTTP 服务器之间是无感的。如果你直接写死 Express 的 `res` 对象等，移植到 Fastify 可能就需要重写。
3. **降低维护成本和减少潜在错误**
    使用框架已有的基础实现，能减少因为自定义逻辑不完善导致的异常响应错误。也方便框架未来升级时减少兼容问题。

如果你的自定义过滤器已经完全覆盖并且保证了所有异常处理逻辑（状态码、格式、日志、跨平台等）都正确无误，且不依赖 `BaseExceptionFilter` 的功能，那么继承它的必要性就不大了。

总结：

- 继承 `BaseExceptionFilter` 是为了复用 Nest 的成熟异常处理机制和跨平台支持。
- 如果你的实现完全自定义且不依赖这些特性，可以不用继承它，直接实现 `ExceptionFilter` 接口即可。

## 完整资源样本{#full-resource-sample}

下面是一个使用多个 **HTTP 装饰器** 创建的基本控制器 `CatsController`，它支持常见的 **增删改查（CRUD）操作**，并通过 DTO 管理数据结构。

```ts
import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';

import {
  CreateCatDto,
  UpdateCatDto,
  ListAllEntities,
} from './dto'; // 引入数据传输对象 DTO

@Controller('cats') // 路由前缀：所有路由以 /cats 开头
export class CatsController {
  @Post() // POST /cats
  create(@Body() createCatDto: CreateCatDto) {
    // 从请求体中提取 JSON 数据并映射到 CreateCatDto 类型
    return 'This action adds a new cat';
  }

  @Get() // GET /cats
  findAll(@Query() query: ListAllEntities) {
    // 从查询参数中提取数据，如 /cats?limit=10
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id') // GET /cats/:id
  findOne(@Param('id') id: string) {
    // 从路由参数中提取 id，例如 /cats/123
    return `This action returns a #${id} cat`;
  }

  @Put(':id') // PUT /cats/:id
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    // 从路由参数获取 id，同时从请求体中获取更新数据
    return `This action updates a #${id} cat`;
  }

  @Delete(':id') // DELETE /cats/:id
  remove(@Param('id') id: string) {
    // 删除指定 ID 的猫咪数据
    return `This action removes a #${id} cat`;
  }
}
```

```ts
// 示例：CreateCatDto
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

DTO 通常使用 `class-validator` 和 `class-transformer` 结合 `@Body()` 一起对数据进行验证和转换。

## 增删改查生成器{#crud-generator}

> `Entity`（实体类）
>
> - 用在 ORM（如 TypeORM、Prisma）中
> - 是后端代码和数据库“表”的映射
> - 通常用在 `Repository.save()`、`Repository.find()` 这样的数据库操作中
>
> Entity 是数据在后端落地的模型，而 DTO 是数据“进门”之前的检查器。

设想一个真实场景：我们需要为两个实体——比如用户（User）和产品（Product）——公开各自的 CRUD 接口。

按照 Nest 的最佳实践，对于每个实体，我们通常需要执行以下多个步骤：

- 使用 `nest g mo` 命令生成模块，以便更好地组织代码、划分清晰边界，并对相关组件进行分组
- 使用 `nest g co` 生成控制器，定义该资源的 CRUD 路由（或在 GraphQL 中定义查询/变更）
- 使用 `nest g s` 创建服务，用于实现和封装该实体的业务逻辑
- 编写一个实体类或接口，用于描述资源的数据结构
- 编写 DTO（数据传输对象）类，用于定义客户端与服务端之间传递数据的格式（GraphQL 中则为输入类型）

这一整套流程虽然清晰规范，但步骤繁琐、重复性高。

为了简化这一过程，Nest 提供了强大的命令行工具（CLI），其中内置的**生成器（schematics）**可以一键自动生成所有这些样板代码，大幅提升开发效率，改善开发体验。

> **支持生成 HTTP 控制器、微服务控制器、GraphQL 解析器（代码优先和架构优先）和 WebSocket 网关**。

```bash
$ nest g resource [name]

? What transport layer do you use?
❯ REST API
  GraphQL (code first)
  GraphQL (schema first)
  Microservice (non-HTTP)
  WebSockets
```

`nest g resource` 命令不仅生成所有 NestJS 构建块（**模块、服务、控制器**类），还生成**实体类**、**DTO 类**以及测试 (`.spec`) 文件，并且自动连接它们。

> 为了避免生成测试文件，你可以传递 `--no-spec` 标志，如下所示：`nest g resource users --no-spec`

## 启动并运行{#getting-up-and-running}

即使我们已经定义了 `CatsController`，Nest 并不会自动识别或实例化它。
 在 NestJS 中，**控制器（Controller）必须显式地注册到模块中**，否则它们不会被框架识别或使用。

**模块是 Nest 应用的基础构建块**

Nest 应用程序是由一个或多个模块组成的。每个模块使用 `@Module()` 装饰器定义，用于声明当前模块中包含的控制器、服务、提供者等组件。

由于我们目前只有一个根模块 `AppModule`，可以直接在其中注册我们的控制器：

```ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController], // 显式注册 CatsController
})
export class AppModule {}
```

- `@Module()`：这是 Nest 提供的模块装饰器，用于声明模块元数据。
- `controllers: [CatsController]`：这表示该模块管理的控制器列表，Nest 会自动扫描这些控制器并为其创建实例。
- `AppModule` 是应用的根模块，**所有功能模块最终都会被引入这里或被该模块间接导入**。

## 特定于库的方法{#library-specific-approach}

Nest 默认使用抽象的方式处理 HTTP 响应（如通过 `@HttpCode()` 设置状态码、返回对象即为响应体等）。但有时候，你可能希望直接使用底层框架（如 Express）的响应对象，这种情况下可以使用 `@Res()` 装饰器注入它。

使用 Express 响应对象：

```ts
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express'; // 显式使用 Express 响应类型

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    // 直接使用 res 对象设置状态码和发送响应
    res.status(HttpStatus.CREATED).send(); // 状态码 201
  }

  @Get()
  findAll(@Res() res: Response) {
    // 返回 JSON 响应
    res.status(HttpStatus.OK).json([]); // 状态码 200，空数组
  }
}
```

 使用 `@Res()` 的注意事项

虽然直接使用底层响应对象提供了更大的灵活性（如自定义头部、设置 Cookie 等），但也存在以下问题：

| 问题                   | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| **与平台耦合**         | 代码依赖于具体的 HTTP 平台（如 Express、Fastify），降低了移植性 |
| **破坏框架功能兼容性** | Nest 的拦截器、过滤器、`@HttpCode()`、`@Header()` 等功能将失效 |
| **影响测试可用性**     | 单元测试中需要手动模拟响应对象（如 mock `res.status()`、`res.send()`） |

推荐方式：启用 passthrough（兼顾框架与底层能力）

你可以使用 `@Res({ passthrough: true })`，该模式允许你对响应对象进行局部控制（如设置 Cookie、标头等），同时依然保留标准的返回机制。

```ts
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK); // 设置响应状态码，但不立即结束响应
  return []; // Nest 继续处理返回值，并序列化为响应体
}
```

 优势：

- 保留框架的自动响应处理（支持拦截器、异常过滤器等）
- 可灵活操作原始响应对象（如设置 Cookie、标头）
- 保持平台切换的灵活性（Express ↔ Fastify）
