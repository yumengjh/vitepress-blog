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
---

# 作用域

## 区别和场景

在传统多线程服务端语言（如 Java/PHP）中：

- 每个请求由独立线程处理，天然隔离
- 需要显式管理线程安全和共享状态

在 **Node.js（及 NestJS）** 中：

- 采用单线程事件循环模型
- 所有请求由主线程通过事件队列异步处理
- **默认行为**：应用级单例（Singleton）共享（如数据库连接池、全局服务）

**安全**：Node.js 的异步 I/O 特性避免了多线程竞争问题，单例模式反而能高效复用资源。

**共享资源的典型场景**：

| 资源类型     | 示例                  | 共享必要性       |
| :----------- | :-------------------- | :--------------- |
| 数据库连接池 | TypeORM/Prisma 连接池 | 避免频繁创建连接 |
| 配置服务     | 全局配置参数          | 运行时不可变     |
| 工具类       | 加密/日志工具         | 无状态复用       |

```js
// 默认的单例服务示例
@Injectable() // 等同于 @Injectable({ scope: Scope.DEFAULT })
export class DatabaseService {
  private pool = new Pool(); // 所有请求共享同一个连接池

  async query(sql: string) {
    const client = await this.pool.connect();
    const result = await client.query(sql);
    client.release(); // 连接放回池中
    return result;
  }
}
```

**需要请求隔离的特殊场景**：

当以下情况出现时，需使用 **请求级作用域（Request-scoped）**：

**场景 1：多租户（Multi-tenancy）**

```js
@Injectable({ scope: Scope.REQUEST }) // 每个请求创建新实例
export class TenantService {
  private tenantId: string;

  setTenant(id: string) {
    this.tenantId = id; // 每个请求独立设置
  }

  getData() {
    return `Data for ${this.tenantId}`;
  }
}
```

**注意**： 若用单例，用户A的设置会污染用户B的请求

**场景 2：请求追踪（Request Tracing）**：

```js
@Injectable({ scope: Scope.REQUEST })
export class LoggerService {
  private requestId: string; // 每个请求独立ID

  setRequestId(id: string) {
    this.requestId = id;
  }

  log(message: string) {
    console.log(`[${this.requestId}] ${message}`);
  }
}
```

**场景 3：GraphQL 数据加载器**：

```js
@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  private loader = new DataLoader(/* ... */); // 每个查询独立缓存

  loadUser(id: string) {
    return this.loader.load(id);
  }
}
```

| **作用域类型**        | **声明方式**                              | 生命周期             | 适用场景           |
| :-------------------- | :---------------------------------------- | :------------------- | :----------------- |
| **单例（默认）**      | `@Injectable()`                           | 应用启动到终止       | 数据库连接、工具类 |
| **请求级**            | `@Injectable({ scope: Scope.REQUEST })`   | 请求开始到结束       | 多租户、请求追踪   |
| **瞬态（Transient）** | `@Injectable({ scope: Scope.TRANSIENT })` | 每次注入时创建新实例 | 极少使用           |

 **最佳实践建议**

1. **默认使用单例**：绝大多数服务应保持无状态，复用实例
2. **谨慎使用请求级作用域**：仅在有明确隔离需求时采用（性能会有轻微损耗）
3. **避免在单例中注入请求级服务**：会导致实例生命周期混乱
4. **微服务不是万能解**：简单隔离需求用请求作用域，分布式系统才需要微服务

> "共享为常态，隔离需显申，微服务慎用，单例保性能"

**默认单例模式 vs 请求级隔离**：

**默认单例模式（共享实例）**

**特点**：所有请求共用同一个服务实例
**声明方式**：`@Injectable()` 或 `@Injectable({ scope: Scope.DEFAULT })`

**优点**

**高性能**

- 避免重复创建实例，减少内存开销
- 适合数据库连接池等重型资源（如 TypeORM/Prisma 连接池）

**天然线程安全**

- Node.js 单线程模型下无需考虑锁机制
- 示例：全局配置服务（运行时不可变数据）

**简化状态管理**

```ts
@Injectable()
export class CounterService {
  private count = 0; // 全局共享状态

  increment() {
    return ++this.count; // 所有请求修改同一个计数器
  }
}
```

**缺点**

**状态污染风险**

如果意外修改共享状态，会导致跨请求数据混乱

典型错误：

```ts
@Injectable()
export class AuthService {
  private currentUser: User; // 危险！所有请求共享该变量

  setUser(user: User) {
    this.currentUser = user; // 用户A会覆盖用户B的数据
  }
}
```

**不适合有隔离需求的场景**

如多租户系统、请求级缓存等

**请求级隔离模式（Request-scoped）**

**特点**：每个请求创建独立实例，请求结束后销毁
**声明方式**：`@Injectable({ scope: Scope.REQUEST })`

**优点**：

**严格的隔离性**

- 每个请求拥有独立上下文，避免数据交叉污染
- 典型场景：

```ts
@Injectable({ scope: Scope.REQUEST })
export class UserContext {
  private userId: string;

  setUser(id: string) {
    this.userId = id; // 每个请求独立存储
  }

  getData() {
    return `User: ${this.userId}`;
  }
}
```

**支持复杂业务逻辑**

- GraphQL 的 DataLoader 缓存隔离
- 请求追踪（每个请求生成唯一日志 ID）

**缺点**

**性能损耗**

- 频繁创建/销毁实例增加 GC 压力
- 测试数据：

```bash
# 压力测试对比（相同请求量）
单例模式：QPS 1500  
请求级隔离：QPS 900 （~40% 性能下降）
```

**依赖注入限制**

- 单例服务不能直接注入请求级服务（NestJS 会报错）
- 必须通过 **请求上下文** 间接获取：

```ts
@Injectable()
export class SingletonService {
  @Inject(REQUEST) private req: Request; // 通过 REQUEST 对象获取上下文
}
```

**总结**：

| **维度**       | 单例模式                 | 请求级隔离                |
| :------------- | :----------------------- | :------------------------ |
| **性能**       | ⭐⭐⭐⭐⭐（最优）            | ⭐⭐（有损耗）              |
| **内存占用**   | 低（共享实例）           | 高（每个请求独立实例）    |
| **线程安全**   | 天然安全                 | 天然安全                  |
| **适用场景**   | 无状态服务、数据库连接池 | 多租户、请求追踪、GraphQL |
| **代码复杂度** | 简单                     | 需处理生命周期依赖        |

> **为什么不叫“多例模式”？**
> 因为它的核心不是“多实例”，而是 **每个请求独立一个实例**（更精确的描述）。

**最佳实践建议**

1. **默认使用单例**
   - 适用于 90% 的场景（如数据库服务、工具类）
2. **仅在必要时隔离**
   - 明确需要请求级状态时（如 `@Res()` 响应对象、多租户）
3. **避免混合使用**
   - 不要将请求级服务注入单例服务（用 **上下文传递** 代替）
4. **性能敏感场景慎用**
   - 高频请求接口避免使用请求级作用域

> **"能用单例就用单例，必须隔离才隔离"**
> **就像餐厅的餐具——公共筷子（单例）效率高，但特殊场合需要个人专用碗（请求隔离）**

## 实践

```ts
@Injectable({ scope: Scope.REQUEST })
export class AppService {
  private count = 0; // 全局共享状态
  getHello(): string {
    return ++this.count + "";
  }
}
```

上述的代码在`{ scope: Scope.REQUEST }`后，每次请求都是1，如果是`DEFAULT`，那么将累加。

| 场景                              | 行为                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| 使用默认作用域（`DEFAULT`，单例） | Nest 在应用启动时创建一个 `AppService` 实例，全局复用。 所有请求都共享这个实例，`count` 会累加。 |
| 使用 `Scope.REQUEST`              | 每个请求都会创建一个新的 `AppService` 实例， `count` 每次从 0 开始，所以每次请求返回的都是 `"1"`。 |

**处理程序的作用域**

| 模式        | 概述                                                         |
| ----------- | ------------------------------------------------------------ |
| `DEFAULT`   | 处理程序在整个应用生命周期内是共享的。它们会在应用启动时被实例化，并在整个应用运行期间持续存在，直到应用关闭时才被销毁。 |
| `REQUEST`   | 专门为每个传入的**请求**创建一个新的处理程序实例。请求完成处理后，该实例将被垃圾回收。 |
| `TRANSIENT` | 处理程序不会在不同的消费者之间共享。每当该依赖被注入时，都会创建一个全新的专用实例。 |

| 作用域                 | 实例创建时机   | 生命周期       | 是否共享                         |
| ---------------------- | -------------- | -------------- | -------------------------------- |
| `DEFAULT`（Singleton） | 应用启动时     | 应用全生命周期 | 所有注入者共享                   |
| `REQUEST`              | 每个请求开始时 | 请求结束后销毁 | 同一请求中共享，不同请求间不共享 |
| `TRANSIENT`            | 每次注入时     | 立即使用即销毁 | 不共享，每次注入新建             |

> **TRANSIENT**（瞬态）  : **没有明确销毁时机**，通常随引用释放（即垃圾回收GC）
>
> 比喻：一次性笔：你用的时候就造一个，什么时候扔你自己决定

**注意**：

**TODO: 待完成**