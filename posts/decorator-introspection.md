---
title: 什么是装饰器内省？说白了就是一个增强版标记系统，让运行时也能获取装饰器信息，不再局限于编译时
date: 2025-06-23
category: Note
tags: 
    - Nest.js
    - TypeScript
description: Nest.js 中的装饰器内省机制, 让装饰器不仅仅是语法糖，而是可以在运行时获取和利用的元数据。
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
---

# 装饰器内省

**TypeScript 装饰器** 是语言本身支持的语法特性，但 **装饰器内省（introspection）** 是一个更高级的概念，它解决了装饰器本身无法直接完成的任务：**在运行时获取和利用装饰器元数据**。

**装饰器的本质**

**TypeScript 装饰器** 是一种特殊的声明，允许你在类、方法、属性或参数上添加元数据或行为。例如：

```ts
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log(`Method ${propertyKey} was called`);
}

class MyClass {
  @Log
  myMethod() {}
}
```

**装饰器的局限性**：装饰器本身只是一个函数，执行后不会自动保存其元数据（如参数、配置）。例如，上面的 `@Log` 装饰器只是打印日志，无法在运行时查询 “哪些方法被 `@Log` 装饰过”。

**装饰器内省**的作用：

**装饰器内省** 指的是 **在运行时动态获取装饰器添加的元数据**，例如：

- 哪些类 / 方法被特定装饰器标记？
- 装饰器的参数是什么？
- 如何基于这些元数据执行额外逻辑（如依赖注入、路由映射、验证）？

**场景**：

**依赖注入（如 NestJS）**：通过装饰器标记类的依赖项，运行时自动解析。

```ts
@Injectable() // 装饰器标记该类可被注入
class MyService {}
```

**路由映射（如 NestJS 控制器）**：通过装饰器定义 API 路径，运行时生成路由表。

```ts
@Controller('users')
class UsersController {
  @Get(':id') // 装饰器定义 HTTP 方法和路径
  findOne(@Param('id') id: string) {}
}
```

**数据验证**：通过装饰器声明字段规则，运行时校验数据。

```ts
class UserDto {
  @IsEmail() // 装饰器定义验证规则
  email: string;
}
```

**实现方式**

TypeScript 本身不直接提供内省能力，但可以通过 **反射 API（Reflect Metadata）** 实现：

**启用反射元数据**（需在 `tsconfig.json` 中配置）：

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

**安装反射库**:

```bash
npm install reflect-metadata
```

**使用 `Reflect.defineMetadata` 和 `Reflect.getMetadata`**：

```ts
import 'reflect-metadata';

// 自定义装饰器，添加元数据
function Role(role: string) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('role', role, target, propertyKey);
  };
}

class MyController {
  @Role('admin')
  deleteUser() {}
}

// 内省：在运行时获取元数据
const role = Reflect.getMetadata('role', MyController.prototype, 'deleteUser');
console.log(role); // 输出: 'admin'
```

**常见的内省应用**

- **框架层面**：NestJS、TypeGraphQL 等框架大量使用装饰器内省实现依赖注入、类型映射、路由生成等。
- **工具库**：如 `class-validator` 通过装饰器定义验证规则，运行时校验数据。
- **自定义场景**：你可以基于内省实现 AOP（面向切面编程）、缓存策略等。

**总结**

- **装饰器** 是语法糖，用于标记类 / 方法 / 属性。
- **装饰器内省** 是一种机制，用于在运行时读取和利用这些标记的元数据。
- TypeScript 装饰器本身不包含内省能力，需要配合反射 API 或其他工具实现。

如果没有内省机制，装饰器的作用仅限于执行副作用（如打印日志），无法实现更高级的功能（如依赖注入、自动路由）。

**理解**

1. **TypeScript 装饰器** 就像给代码 “贴标签”，但这些标签在编译成 JavaScript 后就会消失（被执行或忽略），无法在运行时知道 “哪里贴了标签”。
2. **装饰器内省** 就是给这些 “标签” 额外创建一个 “账本”，专门记录 “哪个类 / 方法 / 属性被贴了什么标签”，并且这个账本会保留到运行时。
3. **举个例子**：
   - 装饰器就像酒店房间门上的 “请勿打扰” 挂牌，客人挂上后（编译时执行装饰器函数），服务员看到牌子（执行装饰器逻辑）就知道该怎么做，但客人退房后（编译完成），牌子会被收走（装饰器消失），无法知道 “这个房间曾经挂过牌子”。
   - 装饰器内省就像酒店前台的登记簿，记录了 “302 房间在 10:00 挂了请勿打扰牌”，即使牌子被收走，前台依然能查询到记录（运行时获取元数据）。

**关键点**：

- **装饰器** 是编译时的语法糖，执行后不会保留自身信息。
- **装饰器内省** 通过 **元数据（metadata）** 机制，在运行时保留装饰器的 “痕迹”，从而实现：
  - 查询哪些代码被哪些装饰器标记过。
  - 获取装饰器的参数（如 `@Role('admin')` 中的 `'admin'`）。
  - 基于这些信息执行动态逻辑（如权限校验、自动路由）。


**为什么这很重要？**

没有内省机制，装饰器只能做简单的 “即时操作”（如日志、性能监控），而无法实现复杂的框架级功能（如依赖注入、ORM、API 文档生成）。内省让装饰器从 “一次性贴纸” 变成了 “可追溯的元数据”，大大扩展了其价值。