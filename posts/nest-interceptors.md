---
title: NestJS 拦截器，用于在请求进入处理前或响应返回客户端前进行“拦截”和“增强”。
date: 2025-07-16
category: Note
tags: 
    - Nest.js
description: NestJS 拦截器，用于在请求进入处理前或响应返回客户端前进行“拦截”和“增强”。
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

# NestJS 拦截器

::: details 目录
[[toc]]
:::

## 拦截器{#interceptors}

拦截器（Interceptors）是 NestJS 中一个强大的功能，它就像是一个"中间人"，**可以在请求到达控制器之前和响应发送给客户端之前进行拦截和处理**。通过 `@Injectable()` 装饰器注解并实现 `NestInterceptor` 接口来创建。

拦截器的灵感来自于 AOP（面向切面编程）的概念，它允许你在不修改应用程序代码的情况下，**添加横切关注点（cross-cutting concerns）**，如日志记录、性能分析、权限验证等。

拦截器可以实现以下功能：

1. **在方法执行前后添加额外逻辑** - 可以在请求处理前后注入自定义的业务逻辑，如日志记录、请求验证等

2. **转换函数返回结果** - 可以修改或转换控制器返回的响应数据，确保返回统一的数据格式

3. **异常转换处理** - 可以捕获并转换函数执行过程中抛出的异常，实现统一的异常处理

4. **扩展核心功能** - 可以为现有功能添加额外的行为，如添加响应头、修改状态码等

5. **条件函数覆盖** - 可以根据特定条件决定是否执行原始函数，常用于实现缓存、权限控制等场景

这些功能使得拦截器成为实现横切关注点的理想工具，能够以非侵入式的方式增强应用程序的功能。

## 基本{#basics}

每个拦截器都需要实现 `intercept()` 方法，该方法接收两个重要参数：

1. `ExecutionContext` 实例，这是与守卫（guards）中使用的完全相同的对象。它继承自 `ArgumentsHost` 类，提供了访问请求、响应等底层对象的能力。`ArgumentsHost` 还根据不同的应用类型（如 HTTP、RPC、WebSocket）暴露不同的参数数组。例如，在 HTTP 场景下，你可以通过 `context.switchToHttp().getRequest()` 获取原生的请求对象，通过 `context.switchToHttp().getResponse()` 获取响应对象；在 RPC 或 WebSocket 场景下，则有对应的 `switchToRpc()`、`switchToWs()` 方法。这样可以让拦截器在不同协议下灵活地访问和操作底层数据。

2. `CallHandler` 实例，这个接口实现了 `handle()` 方法，用于调用路由处理程序。如果不在 `intercept()` 方法中调用 `handle()`，路由处理程序就不会被执行。

`ExecutionContext` 的继承关系值得注意：

- `ExecutionContext` 继承自 `ArgumentsHost`，而 `ArgumentsHost` 是一个通用的参数持有者，能够根据当前上下文（HTTP、RPC、WebSocket）暴露不同的参数数组。
- 具体来说，`ExecutionContext` 在 `ArgumentsHost` 的基础上，增加了对当前处理器（handler）、控制器（class）等元数据的访问能力，这对于拦截器、守卫等高级用法非常有用。
- 你可以通过 `context.getHandler()` 获取当前被调用的方法（处理器），通过 `context.getClass()` 获取当前控制器类，这对于实现基于元数据的逻辑（如自定义装饰器、权限控制等）非常关键。

## 执行上下文{#execution-context}

通过扩展 `ArgumentsHost`，`ExecutionContext` 添加了几个重要的辅助方法，这些方法提供了关于当前执行过程的详细信息：

1. **getClass()** - 返回当前处理请求的控制器类的类型。这对于需要基于控制器类型进行不同处理的场景非常有用。

2. **getHandler()** - 返回对将要调用的处理程序（路由处理方法）的引用。这让你能够访问方法的元数据，比如通过装饰器添加的自定义元数据。

这些方法使得拦截器能够：

- **访问元数据** - 结合自定义装饰器，可以读取控制器或方法级别的元数据，实现更灵活的逻辑控制
- **动态处理** - 根据不同的控制器类型或处理方法采取不同的处理策略
- **条件执行** - 基于方法特征决定是否执行某些逻辑，如缓存、日志等
- **权限控制** - 结合角色装饰器，实现细粒度的权限验证

示例：通过 `getHandler()` 获取路由方法的缓存配置：

```typescript
import { Injectable, CacheInterceptor, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  constructor(protected readonly reflector: Reflector) {
    super();
  }

  trackBy(context: ExecutionContext): string | undefined {
    // 获取当前处理的 handler（方法）
    const handler = context.getHandler();
    // 获取自定义的缓存 key（假设你用 @SetCacheKey() 装饰器设置了元数据）
    const cacheKey = this.reflector.get<string>('cache_key', handler);
    // 如果缓存 key 存在，则返回缓存 key
    if (cacheKey) {
      return cacheKey;
    }
    // 默认行为
    return super.trackBy(context);
  }
}
```

**`@SetCacheKey` 装饰器实现**

```typescript   
import { SetMetadata } from '@nestjs/common';

/**
 * 设置缓存 key 的自定义装饰器
 * @param key 缓存 key
 */
export const SetCacheKey = (key: string) => SetMetadata('cache_key', key);
```

`trackBy()` 方法 是用来生成当前请求的“缓存键”的

`return super.trackBy(context)` 是**走父类的缓存键生成规则**。如果你**没有设置自定义的缓存 Key**，那么就使用**默认的规则**去生成缓存 Key。

NestJS 的缓存系统底层是一个“**键值对**”机制（类似 Redis）。

每个请求，都要生成一个**唯一的缓存键**（Key），才能对响应数据进行缓存。

```ts
return cache.get(key);  // key 用于查缓存
```

如果使用了`@SetCacheKey('xxx')` 装饰器 → 用你设置的 key

否则 → 走**父类的 trackBy** 方法，用默认机制生成 key

更多关于缓存机制，请阅读：[Nest中的请求缓存机制](./nest-practice-tip.html#request-caching-mechanism)

## 调用处理程序{#call-handler}

