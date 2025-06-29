---
title: Nest提供器
date: 2025-06-28
category: Note
tags: 
    - Nest.js 
    - Node.js
description: 学习Nest提供器的一些笔记
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
---

# Nest 提供器

::: details 目录
[[toc]]
:::

## 提供器{#providers}

在 NestJS 中，**提供者** 是一个可以被注入到其他类中的对象，通常用于封装业务逻辑或复用性强的功能。

Nest 中大多数常见的类都可以被视为提供者，例如：

- 服务（Services）
- 仓储类（Repositories）
- 工厂函数（Factories）
- 工具类 / 辅助函数（Helpers）

核心理念：**依赖注入（Dependency Injection）**

Nest 的运行时会自动处理类之间的依赖关系。你只需声明依赖项（如服务），框架就会：

1. 创建实例
2. 管理生命周期
3. 注入到需要的地方

这使得代码**高内聚、低耦合**，同时便于测试和扩展。

> 示例：将服务作为提供者注入控制器：
>
>  创建 `CatsService`
>
> ```ts
> // cats.service.ts
> import { Injectable } from '@nestjs/common';
> 
> @Injectable() // 标记该类为可注入的提供者
> export class CatsService {
>       private readonly cats = [];
> 
>       create(cat) {
>            this.cats.push(cat);
>       }
> 
>       findAll() {
>            return this.cats;
>       }
> }
> ```
>
> **说明**：
>
> - `@Injectable()` 装饰器表示该类可被注入。
> - 该服务维护一个私有数组，用于模拟存储猫的数据。
>
>  控制器中使用 `CatsService`
>
> ```ts
> // cats.controller.ts
> import { Controller, Get, Post, Body } from '@nestjs/common';
> import { CatsService } from './cats.service';
> 
> @Controller('cats')
> export class CatsController {
>   constructor(private readonly catsService: CatsService) {} // 注入服务
> 
>   @Post()
>   create(@Body() cat: any) {
>     this.catsService.create(cat);
>     return 'Cat created successfully';
>   }
> 
>   @Get()
>   findAll() {
>     return this.catsService.findAll();
>   }
> }
> ```
>
> **说明**：
>
> - `CatsController` 的构造函数中声明了对 `CatsService` 的依赖，Nest 会自动注入其实例。
> - 控制器**只负责请求路由处理**，具体逻辑委托给服务，符合 **单一职责原则（SRP）**。
>
> 在模块中注册服务
>
> ```ts
> // app.module.ts 或 cats.module.ts
> import { Module } from '@nestjs/common';
> import { CatsController } from './cats.controller';
> import { CatsService } from './cats.service';
> 
> @Module({
>   controllers: [CatsController],
>   providers: [CatsService], // 注册服务为提供者
> })
> export class AppModule {}
> ```
>
> 提示：建议遵循 SOLID 原则
>
> Nest 的模块和提供者系统天然支持面向对象设计中的 SOLID 原则，尤其是：
>
> - **S**（Single Responsibility）：控制器仅处理 HTTP，服务处理逻辑
> - **D**（Dependency Inversion）：依赖抽象（如接口）而非具体实现

| 项目            | 作用说明                        |
| --------------- | ------------------------------- |
| `@Injectable()` | 标记类为可注入的提供者          |
| `providers`     | 在模块中注册服务等提供者        |
| 构造函数注入    | 自动注入依赖，解耦组件间关系    |
| DI 容器         | Nest 自动管理实例创建与生命周期 |

[SOLID 原则和在NestJS 中的最佳实践](./nest-practice-tip#SOLID-principles-and-best-practices-in-NestJS)

## 服务{#services}

在 NestJS 中，**服务类（Service）用于封装和组织业务逻辑**，并被控制器或其他服务注入使用。
由于服务通常是**单例**，它适合作为跨组件共享的依赖项，是典型的 **提供者（Provider）**。

我们先从创建一个简单的 `CatsService` 开始。该服务用于处理猫相关的数据存储和检索操作，并将被 `CatsController` 所调用，由于它负责管理业务逻辑，是定义为 **提供者（Provider）** 的理想选择。

**`CatsService` 实现**

```ts
// cats.service.ts
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = []; // 本地内存数组，用作数据存储模拟

  create(cat: Cat) {
    this.cats.push(cat); // 将猫对象添加到数组中
  }

  findAll(): Cat[] {
    return this.cats; // 返回所有已添加的猫
  }
}
```

关键点说明

- `@Injectable()`：这是一个装饰器，Nest 用它将类标记为可注入的 **提供者**。
   它告诉 Nest IoC（控制反转）容器可以管理此类的生命周期和依赖关系。
- `cats: Cat[]` 是本地内存中的数组，用于存储猫的数据。在实际项目中，这通常会替换为数据库访问逻辑。

**快捷提示**

使用 Nest CLI 创建服务只需执行以下命令：

```bash
nest g service cats
```

**Cat 接口定义**

服务中使用的 `Cat` 接口用于定义猫对象的数据结构：

```ts
// interfaces/cat.interface.ts
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

在实际应用中，推荐使用 **DTO + 验证** 来限制请求体，而接口可用于定义返回类型。

**在控制器中使用服务**

我们现在将 `CatsService` 注入到控制器中，处理客户端请求时调用服务逻辑。

```ts
// cats.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {} // 依赖注入

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto); // 使用服务处理新增逻辑
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll(); // 使用服务返回所有猫数据
  }
}

// dto/create-cat.dto.ts
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

`private catsService: CatsService`：这是 **TypeScript 的简写写法**，它不仅声明了 `catsService` 属性，还自动将其赋值为构造函数参数中传入的实例（依赖注入）。

控制器通过调用服务的方法，完成业务逻辑的分发，遵循**单一职责原则（SRP）**。

`@Body()` 自动将请求体中的 JSON 数据映射为 `CreateCatDto` 实例，需搭配全局 `ValidationPipe` 实现验证。

## 依赖注入{#dependency-injection}

Nest 是围绕一种强大的设计模式构建的 — **依赖注入（DI）**。
这一模式是 Angular 等大型框架的核心组成部分，也极大增强了模块化、可测试性和可维护性。

> 👉 建议深入阅读 [Angular 官方文档](https://angular.io/guide/dependency-injection)：依赖注入 以了解其设计理念与历史渊源。

在 Nest 中，得益于 TypeScript 的功能，管理依赖非常简单，因为它们是根据其**类型解析**的。在下面的例子中，Nest 将通过创建并返回 `CatsService` 的实例来解析 `catsService`（或者，在单例的情况下，如果已在其他地方请求，则返回现有实例）。然后将此依赖注入到控制器的构造函数中（或分配给指定的属性）：

**Nest 中的依赖注入实现机制**

借助 TypeScript 的类型系统，**Nest 能够自动根据类型推断并注入所需的依赖**，无需手动注册或配置。

**示例：控制器中注入服务**

```ts
import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  // 👇 依赖通过构造函数注入
  constructor(private catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }
}
```

**注释说明：**

| 代码                                            | 含义                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `constructor(private catsService: CatsService)` | TypeScript 的简写写法，声明并自动赋值 `catsService` 属性     |
| `CatsService` 的类型信息                        | Nest 的 IoC 容器会读取此类型，并在模块中查找提供者进行注入   |
| 单例机制                                        | 如果服务类是 `@Injectable()` 并注册为模块 `providers`，Nest 会创建一个全局共享实例（singleton） |
| 生命周期                                        | 默认情况下，Nest 中服务为单例，生命周期与应用相同（除非明确指定为 `scope: Scope.REQUEST` 等） |

**注入过程原理（简化理解）**

1. Nest 启动时扫描模块的 `providers`
2. 根据构造函数参数的类型签名（如 `CatsService`），查找对应的提供者
3. 实例化该服务类（或复用已有实例），注入到控制器的构造函数中
4. 构造函数被调用，依赖赋值成功，控制器即可使用该服务方法

[构造函数自动依赖注入的实现](./nest-practice-tip#constructor(private-catsservice:-catsservice)的原理)

**配套注册：服务必须在模块中注册**

```ts
// cats.module.ts
import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';

@Module({
  controllers: [CatsController],
  providers: [CatsService], // 👈 注册为提供者，才能注入
})
export class CatsModule {}
```

**小结**

| 概念             | 内容                                                         |
| ---------------- | ------------------------------------------------------------ |
| 什么是依赖注入？ | 构造函数或属性中注入外部服务或模块，解耦代码结构             |
| Nest 如何实现？  | 利用 TypeScript 类型系统 + 装饰器，自动构建依赖图并注入      |
| 有哪些优点？     | 结构清晰、低耦合、高可测性，支持服务单例/请求级/自定义生命周期 |
| 注册规则？       | 任何 `@Injectable()` 的类都需通过模块中的 `providers` 数组注册，才可被注入 |

## 作用域{#scopes}

在 Nest 中，**提供者（Provider）默认具有应用级生命周期**，也就是说：

✅ **当应用启动时，Nest 会创建每个提供者的实例**，并在整个应用生命周期内复用这个实例（即默认是单例）。

同样地：

❌ **当应用关闭时，Nest 会销毁这些提供者实例**，执行清理逻辑（如果实现了 `onModuleDestroy()` 或 `onApplicationShutdown()` 等生命周期钩子）。

 默认行为：**全局单例作用域（Application Scope）**

```ts
@Injectable()
export class CatsService {
  // 默认是单例，应用启动时创建一次
}
```

- 所有请求、控制器、模块共享同一个 `CatsService` 实例
- 适用于无状态或缓存类服务，如日志、数据库连接池、配置服务等

可选行为：**请求作用域（Request Scope）**

你也可以声明某个服务为“**请求作用域**”，即：

> 每次有一个新的 HTTP 请求进来，Nest 会为这个请求**重新实例化一份该服务**

```ts
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {
  constructor(@Inject(REQUEST) private request: Request) {}
}
```

- 每个请求都独立拥有自己的服务实例
- 适用于依赖请求上下文的服务（如每个请求用户 ID、请求头）
- Nest 会自动追踪请求上下文并创建正确实例

**实际应用举例**

| 作用域                | 场景               | 示例                       |
| --------------------- | ------------------ | -------------------------- |
| `Application`（默认） | 共享逻辑           | 缓存、配置、日志、DB连接等 |
| `Request`             | 与请求状态强相关   | 当前登录用户服务、权限服务 |
| `Transient`（瞬态）   | 每次注入都新建实例 | 高隔离但代价高，较少使用   |

> **TRANSIENT**（瞬态）  : **没有明确销毁时机**，通常随引用释放（即垃圾回收GC）
>
> 比喻：一次性笔：你用的时候就造一个，什么时候扔你自己决定

**总结**

提供者默认是 **单例**，但可以通过设置作用域变更为 **请求级** 或 **瞬态级别**，用于满足不同的生命周期需求。

在高并发、多用户请求背景下，请求作用域非常实用，但需注意：**性能成本更高**，不要滥用。

[深入掌握 Scope 的完整机制](./nest-singletons-isolation)

