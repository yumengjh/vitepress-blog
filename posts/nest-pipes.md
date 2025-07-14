---
title: NestJS 管道，用于数据过滤、验证和转换
date: 2025-07-13
category: Note
tags: 
    - NestJS
description: NestJS 管道，用于数据过滤、验证和转换
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

# NestJS 管道

::: details 目录
[[toc]]
:::

## 管道{#pipes}

管道（Pipes）是用 `@Injectable()` 装饰器标注的类，实现了 `PipeTransform` 接口，就像流水线上的“加工站”，对输入数据进行处理或校验。管道有两个典型用途：

1. **转型（Transformation）**：将输入数据转换为所需格式，比如把字符串 “123” 变成整数 123。
2. **验证（Validation）**：检查输入数据是否合法，合格的直接放行，不合格的抛出异常。

管道作用于**控制器路由处理器**（即控制器方法）接收的参数，在方法执行前运行。NestJS 会先将参数交给管道处理，管道对参数进行转换或验证，处理后的结果（或抛出的异常）再传递给路由处理器。

NestJS 内置了许多开箱即用的管道，你也可以打造自己的自定义管道。

**提示**：管道运行在“**异常区域**”（exception zone）内。如果管道抛出异常，会由异常层（全局异常过滤器或当前上下文的异常过滤器）处理。因此，管道抛出异常后，控制器方法不会被执行。这为你在系统边界验证外部输入数据提供了一种最佳实践，就像在“入口关卡”过滤掉不合格的数据。

以下是管道的核心接口 `PipeTransform` 的定义，带注释说明其作用：

```typescript
import { ArgumentMetadata } from '@nestjs/common';

// PipeTransform 接口定义了管道的转型/验证逻辑
export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata: ArgumentMetadata): R;
}
```

**代码解释**：

- `@Injectable()`：管道类需要用此装饰器标记，使其可被 NestJS 的 DI 容器管理。
- `PipeTransform`：所有管道必须实现此接口，定义 `transform` 方法，接收输入值（`value`）和元数据（`metadata`），返回处理后的值或抛出异常。
- `value: T`：控制器方法的参数值（如请求的查询参数或 body 数据）。
- `metadata: ArgumentMetadata`：包含参数的上下文信息（如参数类型、名称、是否为 body/query 等）。
- `R`：转换后的返回值类型，可能是原始值、转换后的值或抛出的异常。

**示例：内置管道 `ParseIntPipe`**

NestJS 提供内置的 `ParseIntPipe`，用于将字符串转换为整数并验证：

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  @Get()
  findById(@Query('id', ParseIntPipe) id: number) {
    return { id }; // id 已由 ParseIntPipe 转换为整数
  }
}
```

**解释**：

- **`@Query('id', ParseIntPipe)`**：将查询参数 `id`（如 `"123"`）交给 `ParseIntPipe` 处理。
- **`ParseIntPipe`**：检查 `id` 是否为有效的数字字符串，如果是，转换为整数（如 `123`）；否则抛出 `BadRequestException`。
- **异常区域**：如果 `id` 不是数字（如 `"abc"`），`ParseIntPipe` 抛出异常，交给全局或上下文的异常过滤器处理，控制器方法不会执行。

## 内置管道{#built-in-pipes}

NestJS 提供了一套开箱即用的内置管道，能快速处理常见的转型和验证需求。这些管道包括：

- `ValidationPipe`：验证数据对象（如 DTO），常与 `class-validator` 配合。
- `ParseIntPipe`：将字符串转为整数。
- `ParseFloatPipe`：将字符串转为浮点数。
- `ParseBoolPipe`：将字符串转为布尔值。
- `ParseArrayPipe`：将输入转为数组并验证其内容。
- `ParseUUIDPipe`：验证 UUID 格式。
- `ParseEnumPipe`：验证输入是否属于指定枚举值。
- `DefaultValuePipe`：为缺失的参数提供默认值。
- `ParseFilePipe`：验证上传的文件。
- `ParseDatePipe`：将字符串转为日期对象。

这些管道都从 `@nestjs/common` 包中导出，方便直接使用。

让我们以 `ParseIntPipe` 为例，快速了解它的用法。这是一个典型的**转型**场景：管道确保控制器方法的参数被转换为 JavaScript 整数，如果转换失败则抛出异常。 `Parse*` 管道，包括 `ParseBoolPipe`、`ParseFloatPipe`、`ParseEnumPipe`、`ParseArrayPipe`、`ParseDatePipe` 和 `ParseUUIDPipe`。

以下是 `ParseIntPipe` 的使用示例，展示如何将查询参数转换为整数：

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

@Controller('example')
export class ExampleController {
  @Get()
  findById(@Query('id', ParseIntPipe) id: number) {
    // id 已被 ParseIntPipe 转换为整数
    return { id };
  }
}
```

**代码解释**：

- **`@Query('id', ParseIntPipe)`**：将查询参数 `id`（如 `"123"`）交给 `ParseIntPipe` 处理。
- **`ParseIntPipe`**：尝试将输入字符串转换为整数（通过 `parseInt`）。如果输入有效（如 `"123"`），返回整数 `123`；如果无效（如 `"abc"`），抛出 `BadRequestException`。
- **异常区域**：抛出的异常会被异常过滤器（如全局过滤器）捕获，控制器方法不会执行。
- **类型安全**：`id: number` 确保 TypeScript 编译时检查参数类型，管道在运行时保证实际值符合类型。

`ParseIntPipe` 的内置逻辑（伪代码）

以下是 `ParseIntPipe` 的简化实现，展示其工作原理：

```typescript
import { PipeTransform, BadRequestException } from '@nestjs/common';

export class ParseIntPipe implements PipeTransform {
  transform(value: any): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed: id must be a number');
    }
    return val;
  }
}
```

**解释**：

- **`transform`**：接收输入值，尝试用 `parseInt` 转换为整数。
- **验证**：如果结果为 `NaN`（如输入 `"abc"`），抛出异常。
- **转型**：返回转换后的整数。

## 绑定管道{#binding-pipes}

要使用管道（Pipes），我们需要将管道类的实例绑定到合适的上下文，确保在进入控制器方法前对参数进行转型或验证。以 `ParseIntPipe` 为例，我们希望将它绑定到特定的路由处理程序（控制器方法），确保方法执行前参数被正确处理。NestJS 提供了一种方法参数级别的绑定方式，通过装饰器（如 `@Param` 或 `@Query`）应用管道：

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe, HttpStatus } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catsService.findOne(id); // id 已转为整数
  }
}
```

这种绑定方式确保以下两者之一成立：

1. 控制器方法（如 `findOne`）接收到的参数是预期类型（例如整数 `id`），符合 `catsService.findOne` 的要求。
2. 如果参数无效（例如非数字字符串），管道抛出异常，阻止方法执行。

**示例场景**：
假设请求为 `GET localhost:3000/abc`，`ParseIntPipe` 会抛出以下异常：

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

这个异常会阻止 `findOne` 方法执行，确保只有有效数据进入业务逻辑。

在上面的代码中，我们传递了管道类（`ParseIntPipe`）而非实例，将实例化责任交给 NestJS 框架，启用依赖注入（DI）。管道和守卫类似，也可以传递**就地实例**，以便自定义行为。例如，修改 `ParseIntPipe` 的错误状态码：

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}
```

这种绑定方式同样适用于其他 `Parse*` 管道（如 `ParseBoolPipe`、`ParseUUIDPipe` 等），它们都能处理路由参数、查询参数或请求体。以下是查询参数的例子：

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

再看一个使用 `ParseUUIDPipe` 的例子，确保参数是有效的 UUID：

```typescript
import { ParseUUIDPipe } from '@nestjs/common';

@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid); // uuid 已验证为有效 UUID
}
```

**提示**：`ParseUUIDPipe` 默认验证版本 3、4 或 5 的 UUID。如果需要特定版本，可以通过选项指定：

```typescript
@Param('uuid', new ParseUUIDPipe({ version: '4' }))
uuid: string;
```

绑定 `Parse*` 管道的方式类似，主要用于转型和验证。`ValidationPipe` 的绑定稍有不同。

**提示**：更多 `ValidationPipe` 的详细示例，请参阅 [验证技术](./nest-validation)。

## 定制管道{#custom-pipes}

除了使用 NestJS 提供的内置管道（如 `ParseIntPipe` 和 `ValidationPipe`），你还可以从头打造自定义管道。虽然内置管道已经很强大，但通过构建自定义版本，我们可以深入理解管道的实现原理。本节将从一个简单的 `ValidationPipe` 开始，逐步展示如何创建自定义管道。

我们先构建一个最简单的 `ValidationPipe`，它像一个“中转站”，接收输入值并直接返回，不做任何处理，类似数学中的恒等函数（输入什么，输出什么）：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value; // 直接返回输入值，未做处理
  }
}
```

**提示**：`PipeTransform<T, R>` 是一个泛型接口，所有管道必须实现。它用 `T` 表示输入值 `value` 的类型，用 `R` 表示 `transform` 方法的返回类型。

每个管道都必须实现 `transform` 方法，以满足 `PipeTransform` 接口的契约。这个方法接收两个参数：

- `value`：当前处理的控制器方法参数（在路由处理程序接收前）。
- `metadata`：参数的元数据，描述参数的上下文信息。

元数据对象（`ArgumentMetadata`）包含以下属性：

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom'; // 参数来源
  metatype?: Type<unknown>; // 参数的类型（如 String、Number）
  data?: string; // 装饰器中传递的字符串（如 @Body('key') 的 key）
}
```

**元数据属性解释**：

- `type`：指示参数来源，例如 `@Body()`（请求体）、`@Query()`（查询参数）、`@Param()`（路由参数）或 `@Custom()`（自定义参数）。
- `metatype`：参数的 TypeScript 类型（如 `String`、`Number`）。如果未声明类型或使用普通 JavaScript，值为 `undefined`。
- `data`：装饰器中传递的字符串，例如 `@Body('key')` 的 `key`。如果装饰器括号为空（如 `@Body()`），则为 `undefined`。

**警告**：TypeScript 的接口（interface）在编译为 JavaScript 后会被完全移除，运行时无法获取接口的任何类型信息。因此，如果你的方法参数使用接口类型，NestJS 在运行时获取到的 `metatype` 只会是 `Object`，无法精确反映原本的类型结构。

**如何解决？**
如果你需要在运行时进行类型检查、验证或元数据反射（如在自定义管道或 `ValidationPipe` 中），建议使用 **类（class）** 来定义 DTO（数据传输对象），而不是接口。因为类在编译后依然存在于 JavaScript 代码中，NestJS 可以通过反射机制获取到类的构造函数和类型信息。

## 基于模式的验证{#pattern-based-validation}

让我们的验证管道更有用一些。仔细查看 `CatsController` 的 `create()` 方法，我们可能希望在尝试运行我们的服务方法之前确保请求体对象有效。

接下来，我们关注基于模式的验证。以 `CatsController` 的 `create` 方法为例：

```typescript
  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto); // createCatDto 需验证
  }
```

`CreateCatDto` 定义如下：

```typescript
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

我们需要确保 `createCatDto` 的请求体有效（例如，`name` 和 `breed` 是非空字符串，`age` 是正整数）。直接在控制器方法中验证会违反**单一职责原则（SRP）**，增加代码复杂性。另一种方法是创建一个验证器类，但需要在每个方法开头手动调用，容易遗漏。

中间件可能看似是个选择，但它无法访问执行上下文（如控制器方法或参数），因此不适合通用验证。而管道正是为此设计的：它们在方法调用前处理参数，完美适合验证 `createCatDto`。

## 对象模式验证{#object-mode-validation}

对象模式验证（Schema-Based Validation）是一种以干净、DRY（Don't Repeat Yourself）方式验证复杂对象（如 DTO）的方法。相比在控制器中手动验证，使用基于模式的验证可以让代码更简洁、可复用。[Zod](https://zod.nodejs.cn/) 是一个强大的模式验证库，API 直观，适合与 NestJS 的管道机制结合。本节将展示如何使用 Zod 创建一个自定义验证管道，专注于简单性和可重用性。

> **DRY（Don't Repeat Yourself）** 是软件开发中的一个重要原则，意思是：**不要重复自己**，即相同的逻辑只写一次，重复的代码抽出来。

首先，安装 Zod 库：

```bash
npm install --save zod
```

以下代码展示了一个基于 Zod 的验证管道 `ZodValidationPipe`，它通过构造函数接收一个 Zod 模式（`ZodSchema`），并使用 `schema.parse()` 方法验证输入参数。验证管道要么返回通过验证的值，要么抛出异常。

```typescript
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value); // 使用 Zod 模式验证
      return parsedValue; // 返回验证后的值
    } catch (error) {
      throw new BadRequestException('Validation failed'); // 验证失败抛出异常
    }
  }
}
```

**代码解释**：

- `@Injectable()`：使管道可被 NestJS 的依赖注入（DI）容器管理。
- `constructor(private schema: ZodSchema)`：接收一个 Zod 模式，定义验证规则。
- `transform`：使用 `schema.parse()` 验证输入值 `value`，成功返回解析后的值，失败抛出 `BadRequestException`。
- 异常区域：抛出的异常会被异常过滤器捕获，阻止控制器方法执行。

**Zod 模式定义**

先定义一个 Zod 模式，用于验证 `CreateCatDto`：

```typescript
import { z } from 'zod';

// 定义 Zod 模式
export const CreateCatSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(1, 'Age must be a positive integer'),
  breed: z.string().nonempty('Breed cannot be empty'),
});

// 类型推导（可选，用于 TypeScript 类型安全）
export type CreateCatDto = z.infer<typeof CreateCatSchema>;
```

**说明**：

- `z.object`：定义对象模式的结构。
- `z.string().min(2)`：验证 `name` 是字符串且长度至少 2。
- `z.number().int().min(1)`：验证 `age` 是正整数。
- `z.string().nonempty()`：验证 `breed` 是非空字符串。

**使用 `ZodValidationPipe`**

绑定管道到控制器方法：

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';
import { CreateCatSchema, CreateCatDto} from './create-cat.schema';

@Controller('cats')
export class CatsController {
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateCatSchema)) createCatDto: CreateCatDto,
  ) {
    return { cat: createCatDto }; // createCatDto 已通过 Zod 验证
  }
}
```

**测试**：

```http
POST /cats { "name": "Fluffy", "age": 2, "breed": "Persian" }
```

验证通过，返回 `{ cat: { name: "Fluffy", age: 2, breed: "Persian" } }`。

```http
POST /cats { "name": "F", "age": -1, "breed": "" }
```

抛出 `BadRequestException`，错误消息为 `"Validation failed"`。

```http
POST /cats { "name": "Fluffy", "age": "2", "breed": "Persian" }
```

Zod 自动将 `"2"` 转为 `2`（`z.number()` 的行为）。

**核心功能**

- **ZodValidationPipe**：通过 Zod 模式验证输入数据，确保符合定义的规则（如类型、长度、范围）。
- **可重用性**：通过构造函数传递不同 Zod 模式，管道可用于多种 DTO 验证。
- **异常处理**：验证失败抛出 `BadRequestException`，由异常过滤器捕获，保护控制器方法。

## 绑定验证管道{#binding-validation-pipe}

我们之前学习了如何绑定转换管道（如 `ParseIntPipe` 和其他 `Parse*` 管道），它们专注于将输入转为特定类型（如字符串到整数）。绑定验证管道（如 `ZodValidationPipe`）同样简单，但通常在**方法级别**而非参数级别应用，适合验证复杂的对象（如请求体的 DTO）。将 `ZodValidationPipe` 绑定到控制器方法，确保 `CreateCatDto` 在进入业务逻辑前通过 Zod 模式验证。

绑定 `ZodValidationPipe` 的步骤：

1. 创建 `ZodValidationPipe` 的实例。
2. 在管道构造函数中传递上下文特定的 Zod 模式（schema）。
3. 使用 `@UsePipes()` 装饰器将管道绑定到方法。

**Zod 模式示例**

```typescript
import { z } from 'zod';

// 定义 Zod 模式
export const createCatSchema = z
  .object({
    name: z.string(),
    age: z.number(),
    breed: z.string(),
  })
  .required(); // 确保所有字段非空

// 推导 TypeScript 类型
export type CreateCatDto = z.infer<typeof createCatSchema>;
```

**说明**：

- `z.object`：定义对象的结构，指定字段类型。
- `z.string()` 和 `z.number()`：验证字段类型。
- `.required()`：确保字段非空（`null` 或 `undefined` 会被拒绝）。
- `z.infer`：从模式推导 TypeScript 类型，确保类型安全。

**绑定管道**

使用 `@UsePipes()` 装饰器将 `ZodValidationPipe` 绑定到控制器方法：

```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';
import { CreateCatDto, createCatSchema } from './create-cat.schema';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCatSchema)) // 绑定 ZodValidationPipe
  async create(@Body() createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto); // createCatDto 已通过验证
  }
}
```

**代码解释**：

- `@UsePipes(new ZodValidationPipe(createCatSchema))`：在方法级别绑定管道，验证整个请求体。
- `createCatDto: CreateCatDto`：TypeScript 类型确保编译时安全，Zod 模式在运行时验证。
- 验证逻辑：`ZodValidationPipe` 使用 `createCatSchema` 验证请求体，失败时抛出 `BadRequestException`。

**提示**：`@UsePipes()` 从 `@nestjs/common` 导入，用于方法级管道绑定。

**警告**：使用 Zod 库需在 `tsconfig.json` 中启用 `strictNullChecks` 以确保严格的类型检查：

```json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

增强 `ZodValidationPipe` 提供详细错误：

```typescript
import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      // 提取 Zod 错误详情
      throw new BadRequestException(
        error.errors.map((e: any) => e.message).join(', '),
      );
    }
  }
}
```

**开发建议**

增强 Zod 模式，添加更严格的验证规则：

```typescript
export const createCatSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(1, 'Age must be a positive integer'),
  breed: z.string().nonempty('Breed cannot be empty'),
});
```

**`@UsePipes(new ZodValidationPipe(createCatSchema))` 和 `@Body(new ZodValidationPipe(createCatSchema))` 的区别**

`@UsePipes()` 在方法级别绑定管道

```typescript
@Post()
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}
```

**作用范围**：`@UsePipes()` 是一个方法级装饰器，将管道应用于整个控制器方法，影响方法中所有参数（如 `@Body()`、`@Query()`、`@Param()` 等）。

**验证对象**：在例子中，`ZodValidationPipe` 会被应用到所有参数，但由于方法只有一个 `@Body()` 参数，实际效果是验证整个请求体 `createCatDto`。

**适用场景**：适合需要对多个参数统一应用管道的场景，或者当你想为整个方法定义统一的验证逻辑。

`@Body(new ZodValidationPipe())` 在参数级别绑定管道

```typescript
@Post()
async create(@Body(new ZodValidationPipe(createCatSchema)) createCatDto: CreateCatDto) {
  return this.catsService.create(createCatDto);
}
```

**作用范围**：`@Body(new ZodValidationPipe(createCatSchema))` 是一个**参数级装饰器**，仅对` @Body()` 参数（即请求体 `createCatDto`）应用管道。

**验证对象**：`ZodValidationPipe` 只验证请求体，不会影响其他参数（如 `@Query()` 或 `@Param()`）。

**适用场景**：适合需要针对特定参数（如请求体）进行验证的场景，更加精确。

**总结**：

**@UsePipes()**：方法级绑定，影响所有参数，适合统一验证逻辑。

**@Body(new ZodValidationPipe())**：参数级绑定，仅验证请求体，适合精确控制。

在单一 `@Body()` 场景下，两者效果相同，但多参数时参数级更灵活。

**在实际开发中，参数级管道比方法级管道用的多，方法级管道一般只在特殊场景下使用。**

**参数级管道**

```typescript
@Post('demo/:id')
demo(
  @Param('id', new ParseIntPipe()) id: number,
  @Query('q', new DefaultValuePipe('default')) q: string,
  @Body(new ValidationPipe()) body: MyDto,
) { ... }
```

优点：

- 只对当前参数生效，类型安全，不会误伤其他参数。

- 代码可读性强，维护简单。

- 适合大多数业务场景（如单独校验 id、query、body）。

**方法级管道**

```typescript
@Post('demo')
@UsePipes(new ValidationPipe())
demo(@Body() body: MyDto) { ... }
```

优点：

- 适合所有参数都需要同一套校验规则的场景。

- 适合自定义复杂管道（如多参数联合校验、日志、全量转换等）。

缺点：

- 所有参数都会经过同一个管道，容易混淆，需要在管道内部判断参数类型。

- 代码维护难度略高。

**全局管道**

```typescript
app.useGlobalPipes(new ValidationPipe());
```

适合全局 DTO 校验、全局数据清洗。

**方法级管道示例**：根据参数类型选择对应 schema 校验

::: details 展开

```typescript
// zod schema 用于 body 校验
const bodySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  age: z.preprocess(val => Number(val), z.number().min(3, { message: 'Age must be at least 3' })),
});
// zod schema 用于 query 校验
const querySchema = z.object({
  q: z.string().min(1, { message: 'q 不能为空' }),
});
// zod schema 用于 param 校验
const paramSchema = z.object({
  id: z.preprocess(val => Number(val), z.number().int().min(1, { message: 'id 必须为正整数' })),
});
```

```typescript
class MultiTypePipe implements PipeTransform {
  constructor(
    private paramSchema: z.ZodTypeAny,
    private querySchema: z.ZodTypeAny,
    private bodySchema: z.ZodTypeAny
  ) {}
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param') {
      const result = this.paramSchema.safeParse({ id: value });
      if (!result.success) {
        const msg = result.error.issues.map(i => i.message).join('; ');
        throw new BadRequestException('路径参数 id 校验失败: ' + msg);
      }
      console.log('param:', value);
      return value;
    }
    if (metadata.type === 'query') {
      const result = this.querySchema.safeParse(value);
      if (!result.success) {
        const msg = result.error.issues.map(i => i.message).join('; ');
        throw new BadRequestException('查询参数 q 校验失败: ' + msg);
      }
      console.log('query:', value);
      return value;
    }
    if (metadata.type === 'body') {
      // 兼容 body 是字符串的情况
      if (typeof value === 'string') {
        try { value = JSON.parse(value); } catch { throw new BadRequestException('Body 不是有效的 JSON'); }
      }
      const result = this.bodySchema.safeParse(value);
      if (!result.success) {
        const msg = result.error.issues.map(i => i.message).join('; ');
        throw new BadRequestException('请求体校验失败: ' + msg);
      }
      console.log('body:', value);
      return value;
    }
    return value;
  }
}
```

```typescript
@Post('demo/:id')
@UsePipes(new MultiTypePipe(paramSchema, querySchema, bodySchema))
pipeDemoMethod(
    @Param('id') id: number,
    @Query() query: any,
    @Body() body: any,
    ) {
        return {
            param: id,
            query,
            body,
        };
    }
```

:::

## 类验证器{#class-validator}
