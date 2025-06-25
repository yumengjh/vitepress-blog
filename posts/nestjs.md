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
