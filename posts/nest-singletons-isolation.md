---
title: Nest.js中的单例模式和请求级作用域
date: 2025-06-23
category: Note
tags: 
    - Nest.js
    - Node.js
description: 最佳实践是，能用单例就用单例，必须隔离才隔离
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
---

# 注入作用域

::: details 目录

[[toc]]

:::

## 注入作用域{#injection-scopes}

对于来自不同编程语言背景的开发者来说，Nest 中几乎所有内容在请求之间都是共享的，这可能让人意外。比如，我们通常使用数据库连接池或带有全局状态的单例服务。请记住，Node.js 不同于传统多线程无状态请求/响应模型，在 Node.js 中，所有请求由单线程事件循环处理，因此使用单例实例在大多数情况下是安全且高效的。

不过，在某些特殊场景下，基于请求生命周期的服务行为是必须的，例如 GraphQL 应用中的每请求缓存、请求追踪以及多租户支持。注入作用域机制允许我们为提供者指定不同的生命周期，从而满足这些需求。

## 提供器作用域{#provider-scope}

NestJS 中的提供者 (Provider) 是通过依赖注入机制被应用系统管理的类实例。

Nest 提供 **3 种作用域 (Scope)** ：

| Scope 类型         | 生命周期       | 是否共享           | 适用场景           |
| ------------------ | -------------- | ------------------ | ------------------ |
| `DEFAULT` (单例)   | 应用启动时     | 是，全应用共享     | 配置服务，DB连接池 |
| `REQUEST` (请求级) | 每个请求开始时 | 不，各请求独立存在 | 多租户，访问追踪   |
| `TRANSIENT` (瞬态) | 每次注入时     | 不，每次新建       | 简单静态计算       |

- **DEFAULT** ：提供程序的单个实例在整个应用中共享。实例生命周期与应用生命周期直接相关。应用启动后，所有单例提供程序都已实例化。默认情况下使用单例作用域。
- **REQUEST** ：专门为每个传入的**请求**创建一个新的提供程序实例。请求完成处理后，该实例将被垃圾回收。
- **TRANSIENT** ： 临时提供器不在消费者之间共享。每个注入临时提供器的消费者都将收到一个新的专用实例。

对于大多数用例，建议使用单例范围。跨消费者和跨请求共享提供器意味着一个实例可以被缓存并且它的初始化只发生一次，在应用启动期间。

**各作用域解析**

**DEFAULT （单例）**

```ts
@Injectable() // 等同于 @Injectable({ scope: Scope.DEFAULT })
export class ConfigService {
  private readonly options = loadConfig();
  get(key: string) {
    return this.options[key];
  }
}
```

**特性：**

- Nest 应用启动时初始化一次，全应用共享
- 适合无状态服务：日志、配置、DB 连接池
- 性能最优，内存占用最低

**风险：**

- 不适合保存请求级状态（如 currentUser）
- 如果不小心使用全局变量保存状态，容易造成跨请求数据乱用

**REQUEST （请求级）**

```ts
@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
  private userId: string;
  setUser(id: string) {
    this.userId = id;
  }
  getUserId() {
    return this.userId;
  }
}
```

**特性：**

- Nest 会为每个请求单独创建实例
- 适用于需要独立保存请求信息的场景
- 支持 GraphQL的 dataloader 隔离

**缺点：**

- 性能有所损耗（每次请求都会创建新实例）
- 不能被单例服务注入，否则会报错

**TRANSIENT （瞬态）**

```ts
@Injectable({ scope: Scope.TRANSIENT })
export class CalculatorService {
  getTimestamp() {
    return Date.now();
  }
}
```

**特性：**

- 注入谁，创建新实例，不保存
- 适合需要定制独立计算的场景
- 少量场景使用，性能费用最高

**实际场景指南**

| 场景               | 推荐 Scope | 说明                               |
| ------------------ | ---------- | ---------------------------------- |
| 配置服务           | DEFAULT    | 无状态，启动初始化一次             |
| 日志服务           | DEFAULT    | 无状态，日志打印都共用一个实例     |
| 用户上下文         | REQUEST    | 需要请求隔离，各自存储 currentUser |
| GraphQL dataloader | REQUEST    | 各请求独立 cache                   |
| 简单事务计算       | TRANSIENT  | 每次注入都要新建实例               |

**最佳实践**

1. 默认使用 **DEFAULT** (单例)，最简单高效
2. 有明确隔离需求时，使用 **REQUEST**
3. 禁止单例服务注入 request 级服务，NestJS 会报错
4. 若需传递 request 上下文，使用 `@Inject(REQUEST)`

**行为对比**

| 维度      | DEFAULT (单例) | REQUEST (请求级) | TRANSIENT (瞬态) |
| --------- | -------------- | ---------------- | ---------------- |
| 性能      | 高             | 中               | 最低             |
| 内存      | 最低           | 中               | 最高             |
| 缓存/保存 | 是             | 是（同请求内）   | 否               |
| 隔离性    | 否             | 是               | 是               |
| 适用场景  | DB连接池/配置  | 用户上下文/trace | 注入时加工       |

能用单例，尽量用单例，有需求隔离时，用 REQUEST ，较简单而静态，瞬态并非常用，主要用于特殊场景，不推荐普遍使用。

**同一个请求内创建的所有 `REQUEST` 作用域服务实例是共享的**。

Nest 会为每个传入请求创建一个 **独立的“请求上下文容器”**，该容器内的 `REQUEST` 作用域服务实例会被缓存。如果多个服务或控制器在同一个请求中依赖同一个 `REQUEST` 作用域的服务，它们会接收到 **相同的实例**，从而实现数据共享。

**示例**

```ts
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private requestId = uuid();
  getRequestId() {
    return this.requestId;
  }
}
```

```ts
@Controller()
export class SomeController {
  constructor(private readonly ctx: RequestContextService) {}

  @Get()
  handle() {
    return this.ctx.getRequestId(); // 每次请求生成的新 ID
  }
}
```

```ts
@Injectable()
export class AnotherService {
  constructor(private readonly ctx: RequestContextService) {}

  logRequest() {
    console.log(this.ctx.getRequestId()); // 同一个请求中和 Controller 得到的是同一个 ID
  }
}
```

只要这两个类都是处理 **同一请求** 的，它们拿到的是 **同一个 RequestContextService 实例**。

注意：

**不同请求之间的数据不会共享**

单例作用域（`DEFAULT`）服务不能依赖注入 `REQUEST` 服务，否则 Nest 会报错（因为生命周期不兼容）

```ts
// ❌ 错误用法：默认作用域（单例）注入请求级作用域
@Injectable()
export class SingletonService {
  constructor(private readonly ctx: RequestContextService) {}
}

// Error: Nest can't resolve dependencies of the SingletonService (?). Please make sure that the argument at index [0] is available...
```

正确做法：将 `AnotherService` 也声明为 `REQUEST` 作用域

若需要在单例中访问请求信息，应使用 `@Inject(REQUEST)` 注入 Express 的 Request 对象，但：
- **该方法仅限访问原始请求数据**，如 headers、query、params、body、IP、user 等（即从 HTTP 请求中解析的基础信息）
- **不能通过这种方式访问 Nest 管理的请求级服务实例**，例如 `UserContextService`。这是因为这些服务是由 Nest 基于请求上下文容器动态创建和管理的，只有声明为 `REQUEST` 作用域的类中才能通过构造函数注入得到它们。
- 简单理解：你可以拿到“请求数据”，但拿不到“跟这个请求绑定的 Nest 服务”

**总结**

- 🚫 **单例服务永远不应该“知道”请求级状态**
- ✅ **请求状态应由控制器或请求服务掌握并向下传**
- 🧠 **职责清晰、状态隔离是框架设计的底线**
- ⚠️ Nest 强制禁止的，其实就是你业务逻辑上本不该做的

**实际场景**：如果某个单例服务内部需要用到当前请求级数据（如当前用户 ID），该怎么办？

错误方式：

```ts
@Injectable()
export class SingletonService {
    constructor(private readonly userCtx: UserContextService) {} // ❌ 直接注入请求级服务，Nest 启动时报错
}
```

正确做法：**由调用者在同一个请求中，将数据“向下传”给单例服务**

也就是说，请求级数据不要让服务自己“去找”，而是由请求上下文**的上层代码传下去**（类似函数参数的方式）

示例：

```ts
// ✅ 单例服务，不知道请求，也不依赖请求服务
@Injectable()
export class LoggerService {
  log(message: string, traceId: string) {
    console.log(`[${traceId}] ${message}`);
  }
}
```

```ts
// ✅ 请求级服务：知道当前 traceId
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
    private traceId: string;
    setTraceId(id: string) {
        this.traceId = id;
    }
    getTraceId() {
        return this.traceId;
    }
}
```

```ts
// ✅ 控制器中协调：读取请求级数据，传给单例服务
@Controller()
export class AppController {
    constructor(
    private readonly ctx: RequestContextService,
     private readonly logger: LoggerService
    ) {}

    @Get()
    handle() {
        const traceId = this.ctx.getTraceId();
        this.logger.log('处理完成', traceId);
        return 'OK';
    }
}
```

| 错误方式                                 | 正确方式                         |
| ---------------------------------------- | -------------------------------- |
| ❌ 服务自己注入另一个生命周期不一致的服务 | ✅ 上层读取后传参                 |
| ❌ 单例服务想“偷”请求状态                 | ✅ 请求级服务调用单例时传递状态值 |

**“在一个请求中同时使用单例和请求级服务” 是允许的、也是常态。**
 关键是：**单例不要去“注入”请求级服务，而是由请求路径控制谁调用谁、谁传值给谁。**

**实战建议**

| 学到的知识       | 实战中该怎么用                                               |
| ---------------- | ------------------------------------------------------------ |
| 请求级作用域     | 理解原理即可，能不用就不用，参数传递更清晰                   |
| 依赖注入         | 习惯了就好，不用纠结底层实现，关注结构划分即可               |
| 装饰器元编程     | 有用时才写，过度封装会降低团队可读性                         |
| 生命周期与 scope | 在做大型系统时确实有价值，但不必在每个小项目都强行套上这些思维 |

## 用法{#usage}

通过将 `scope` 属性传递给 `@Injectable()` 装饰器选项对象来指定注入作用域：

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

