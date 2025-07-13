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
