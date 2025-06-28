---
title: 记一些Nest.js的一些坑或技巧
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

## 使用 @nestjs/serve-static 托管静态资源

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

## interface & DTO & Entity 的区别

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

## REST 和 CRUD 的区别

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

## 动态移除Header

在**最佳实践**中，建议移除或隐藏一些可能**暴露后端实现细节的响应头（Header）**，这是提升安全性和防止信息泄露的一个常见手段。

比如暴露 `X-Powered-By: Express`，攻击者知道你用的是 Express，就可能利用已知的 Express 漏洞、攻击点或中间件绕过方式。

使用中间件，动态移除一些 HTTP 响应头，比如 x-powered-by，以提升安全性。

```ts
// security.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 移除 x-powered-by，可以根据需求加上自定义逻辑层进行动态移除
    res.removeHeader('x-powered-by');
	
    // 还可以换上一些...
    next();
  }
}
```

在 app.module.ts 注册全局中间件

```ts
// app.module.ts
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SecurityMiddleware } from './middlewares/security.middleware';

// ...

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
```

如果只是简单移除，可以在 **main.ts** 使用`app.disable('x-powered-by');`

```ts
const expressApp = app.getHttpAdapter().getInstance();
expressApp.disable('x-powered-by');
```

Express有可能在中间件执行后**又添加一次 `x-powered-by`**（Express 默认行为），导致你的 `removeHeader` 失效。

```ts
// 推荐的安全 HTTP Header
res.setHeader('X-Content-Type-Options', 'nosniff'); // 防止 MIME 类型混淆攻击
res.setHeader('X-Frame-Options', 'DENY'); // 禁止页面被 iframe 嵌套（点击劫持防护）
res.setHeader('X-XSS-Protection', '1; mode=block'); // 启用浏览器 XSS 过滤
res.setHeader('Referrer-Policy', 'no-referrer'); // 限制 Referer 泄露
```

`helmet` 会自动添加大量安全 header，非常省心，推荐生产环境使用。

```bash
npm i helmet
```

```ts
import helmet from 'helmet';

const app = await NestFactory.create(AppModule);
app.use(helmet());
```

## Request 中的 ip 和 headers

`Request` 的类型推断中，有时**不包含 `.ip` 和 `.headers` 的类型定义**（虽然运行时这些字段确实存在）。
 所以会出现这种编译时的报错：

```json
TS2339: Property 'ip' does not exist on type 'Request<...>'.
TS2339: Property 'headers' does not exist on type 'Request<...>'.
```

使用类型合并处理

```ts{7}
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('init')
export class InitController {
  @Get()
  getInitInfo(@Req() request: Request & { ip: string; headers: any }) {
    return {
      status: 'Successful startup',
      env: process.env.NODE_ENV || 'unknown',
      vercel: !!process.env.VERCEL,
      ip: request.ip,
      'x-forwarded-for': request.headers['x-forwarded-for'] || null,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
```

## process.cwd() &  __dirname

`process.cwd()` 获取 Node.js **进程的当前工作目录**，即启动进程时所在的路径。

**使用场景：**

- 获取项目根路径（依赖启动位置）
- 读取 `.env` 或其他根级配置文件
- 动态构建路径（如日志存储、上传目录）

**注意事项：**

- 值会随着 `process.chdir()` 改变
- **结果与模块位置无关**，依赖于 Node.js 启动命令的工作目录

`__dirname` 获取当前模块文件所在的**目录的绝对路径**。

**使用场景：**

- 加载与当前模块相对的资源文件（如 JSON、配置等）
- 构建模块内部专用的静态路径（如模板、图像）

 **注意事项：**

- 值在模块中是固定的
- 在 **ES Module** 模式下需用 `import.meta.url` 处理后获取

**稳定性**：使用 `process.cwd()` 保证无论在哪个模块调用，日志目录始终定位到**项目根路径**。

**可移植性**：如果该模块作为 npm 包被引入，它仍然能把日志写入**宿主项目的根目录**。

**一致性**：与 NestJS 应用级资源和组件通常位于根路径的设计保持一致。

## SOLID 原则和在NestJS 中的最佳实践{#SOLID-principles-and-best-practices-in-NestJS}

**SOLID 原则简述（面向对象设计五大原则）**

| 原则  | 全称                                   | 简要说明                             |
| ----- | -------------------------------------- | ------------------------------------ |
| **S** | **Single Responsibility** 单一职责原则 | 一个类只做一件事，职责要单一         |
| **O** | **Open/Closed** 开放封闭原则           | 对扩展开放，对修改封闭               |
| **L** | **Liskov Substitution** 里氏替换原则   | 子类能替代父类出现在任何地方         |
| **I** | **Interface Segregation** 接口隔离原则 | 不强迫实现无关接口，接口应小而精     |
| **D** | **Dependency Inversion** 依赖倒置原则  | 高层模块不依赖底层模块，依赖抽象接口 |

在 NestJS 中的实践建议

| 原则  | NestJS 实践方式                                              |
| :---: | ------------------------------------------------------------ |
| **S** | 控制器只负责处理请求/响应，服务负责业务逻辑，数据库操作交给仓储（Repository）等模块，**职责分离** 清晰 |
| **O** | 使用 `extends` / `implements` 复用逻辑，通过模块或服务替换实现，**无需修改原始逻辑即可扩展功能** |
| **L** | 使用接口或抽象类注入不同实现类，子类可以透明替代，符合**模块互换性要求** |
| **I** | 使用专门的接口划分服务职责，避免定义过大的 DTO 或服务接口    |
| **D** | 借助 Nest 的依赖注入容器，使用接口 + `useClass` / `useFactory` / `useExisting` 等方式注入依赖，**依赖于抽象而非具体实现** |

示例：依赖倒置在 Nest 中的应用

```ts
// 定义抽象接口
export interface NotificationService {
  send(message: string): void;
}

// 提供默认实现
@Injectable()
export class EmailService implements NotificationService {
  send(message: string) {
    console.log(`Send email: ${message}`);
  }
}

// 模块中绑定接口与实现
@Module({
  providers: [
    {
      provide: 'NotificationService',
      useClass: EmailService,
    },
  ],
})
export class NotifyModule {}
```

在消费者中使用：

```ts
@Injectable()
export class AlertService {
  constructor(
    @Inject('NotificationService') private readonly notifier: NotificationService,
  ) {}

  alert(msg: string) {
    this.notifier.send(msg);
  }
}
```

**总结**

- **SOLID 原则为模块化、可测试、可维护的架构提供理论基础**
- **Nest 的依赖注入系统天生支持 SOLID 实践**
- **保持代码职责清晰、接口细化、依赖抽象，是编写良好 NestJS 应用的关键**

## DTO 和 Interface的最佳实践{#best-practices-for-DTOs-and-interfaces}

在 NestJS 中，应该用 interface 还是 DTO（类）来限制数据结构？是否需要二者分离，比如 interface 给服务用，DTO 给控制器用？

**在控制器处理请求时统一使用 DTO（类 + 验证器）作为类型定义，在服务层也尽量复用 DTO，除非确实需要定义不同的内部结构。**

换句话说：

- 控制器用 **DTO 类（含验证器）**
- 服务层 **优先复用 DTO（作为输入类型）**，但可用 `interface` 或 `Pick<>` 等组合方式做适当抽象

**为什么推荐统一使用 DTO？**

DTO 是类，支持 **运行时验证**

NestJS 的 `ValidationPipe` 是基于 **类的元数据（装饰器）** 来进行运行时校验的，而接口只在 **TypeScript 编译时检查**，无法用于运行时校验。

```ts
@IsString()
name: string;
```

只有在类中才有效，interface 无法使用这些装饰器。

**类可以被 Nest 扫描、序列化、文档化（如 Swagger）**

如果你将来使用 `@nestjs/swagger` 自动生成接口文档，DTO 是必要前提，因为：

```ts
@ApiBody({ type: CreateCatDto })
```

只接受 class 类型，interface 无法参与元数据生成。

**类型一致性：服务层使用 DTO，减少重复定义**

如果你把接口专门用于服务层（如 `Cat`），而控制器使用 DTO（如 `CreateCatDto`），会面临两个重复数据结构：

```ts
// interface Cat
interface Cat {
  name: string;
  age: number;
  breed: string;
}

// class CreateCatDto
export class CreateCatDto {
  @IsString()
  name: string;
  @IsInt()
  age: number;
  @IsString()
  breed: string;
}
```

 这种重复带来维护成本，未来字段调整时需要改两份。

**那什么时候使用 interface 比较合适？**

| 场景                       | 原因                                                         |
| -------------------------- | ------------------------------------------------------------ |
| 服务层中的内部数据结构     | 比如组合模型、只读输出对象、数据库查询结果等，**不需要验证** |
| 泛型工具类型               | 如 `Partial<Cat>`、`Pick<Cat, 'name'>` 等功能性类型          |
| 定义返回类型               | 如 `Promise<Cat[]>`，用于表示服务返回内容结构                |
| 定义接口约束（不带装饰器） | 比如 `NotificationService` 接口，只用于类型抽象，不用于验证  |

**推荐实践**

```ts
// CreateCatDto.ts（控制器用、也可传给服务）
export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}

// Cat.interface.ts（仅用于返回类型或数据库模型）
export interface Cat {
  id: number;
  name: string;
  age: number;
  breed: string;
  createdAt: Date;
}
```

控制器使用：

```ts
@Post()
create(@Body() dto: CreateCatDto) {
  this.catsService.create(dto);
}
```

服务使用：

```ts
create(cat: CreateCatDto) {
  // ...
}
```

返回类型使用接口：

```ts
findAll(): Cat[] {
  // ...
}
```

**总结**

| 比较项           | DTO（类）            | Interface                        |
| ---------------- | -------------------- | -------------------------------- |
| 编译时类型检查   | ✅                    | ✅                                |
| 运行时验证       | ✅（装饰器 + Pipe）   | ❌                                |
| Swagger 文档生成 | ✅                    | ❌                                |
| 可继承、组合     | ✅（类继承）          | ✅（工具类型如 Pick）             |
| 推荐用途         | 请求体输入、入参校验 | 返回值类型、数据库模型、只读结构 |

**实战建议**：

- 请求数据统一使用 DTO（含验证）
- 服务逻辑中可直接用 DTO，也可封装更抽象的接口
- 避免定义内容重复的 interface + DTO 两套系统

## constructor(private catsService: CatsService)的原理

为什么写 `constructor(private catsService: CatsService)` 就能自动注入 CatsService 的实例？

这是 **NestJS 的依赖注入机制 + TypeScript 类型信息反射** 的结果。

**原理简述：**

Nest 会在应用启动时**扫描构造函数的参数类型**，并根据 `CatsService` 的类型，在当前模块的 `providers` 数组中查找是否有该类的提供者。

具体过程：

```ts
constructor(private catsService: CatsService) {}
```

- `CatsService` 是类，也是一个类型（TS 允许类作为类型）
- Nest 通过 **TypeScript 的设计时类型信息 + `Reflect` 元数据** 得知你需要 `CatsService`
- 如果它已注册为模块的 provider（如下），Nest 就会自动创建实例并注入：

```ts
@Module({
  providers: [CatsService], // 👈 注册为可注入类
})
```

要实现这一功能，你必须：

1. 类上使用 `@Injectable()` 装饰器（使其变为 Nest 可管理的提供者）
2. 在当前模块的 `providers` 中注册它

**TODO** 不够详细

## private的简写

```ts
constructor(private catsService: CatsService) {}
```

这是 **TypeScript 的简写语法**，用于自动声明并初始化成员属性。

等价于以下完整写法：

```ts
class CatsController {
  private catsService: CatsService;

  constructor(catsService: CatsService) {
    this.catsService = catsService;
  }
}
```

所以 `private catsService: CatsService` 的意思是：

- 定义一个名为 `catsService` 的私有属性，类型为 `CatsService`
- 同时将构造函数传入的参数赋值给这个属性

