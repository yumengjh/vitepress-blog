---
title: Supabase 是一个开源免费的 PostgreSQL 数据库，提供了现代化的 REST 风格 API 查询接口
date: 2025-07-07
category: Note
tags: 
    - Supabase
description: Supabase 是一个开源 Firebase 替代品，底层基于 PostgreSQL 数据库。它不仅提供 SQL 访问方式，还提供了现代化的 REST 风格 API 查询接口，这在前端项目中极其方便
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: true
aside: true
noSearch: false 
---

::: details 目录
[[toc]]
:::

# Supabase API 

## 基础查询 `.from().select()` {#basic-select}

**Supabase**：

```ts
const { data, error } = await supabase
.from('users')
.select('*');
```

**MySQL**：

```sql
SELECT * FROM users;
```

## 条件筛选 `.eq()` / `.neq()` / `.lt()` / `.gt()` / `.gte()` / `.lte()` {#conditions}

**Supabase**：

```ts
supabase.from('users').select('*')
    .eq('age', 18)
    .neq('status', 'inactive')
    .gt('score', 60)
    .lt('rank', 100)
    .gte('experience', 3)
    .lte('level', 5);
```

**MySQL**：

```sql
SELECT * FROM users
WHERE age = 18 AND status != 'inactive' AND score > 60
AND rank < 100 AND experience >= 3 AND level <= 5;
```

## 范围匹配 `.in()` / `.not()` / `.like()` / `.ilike()` {#range-matching}

**Supabase**：

```ts
supabase.from('users').select('*')
    .in('role', ['admin', 'editor'])
    .like('email', '%@gmail.com')
    .ilike('username', '%john%');
```

**MySQL**：

```sql
SELECT * FROM users
WHERE role IN ('admin', 'editor')
  AND email LIKE '%@gmail.com'
  AND username ILIKE '%john%';
```

## 组合条件 `.or()` / `.not()` / `.filter()` {#logical-combination}

**Supabase**：

```ts
supabase.from('users')
    .select('*')
    .or('status.eq.active,status.eq.pending')
    .not('deleted', 'is', true)
    .filter('age', 'gte', 18);
```

**MySQL**：

```sql
SELECT * FROM users
WHERE (status = 'active' OR status = 'pending')
  AND deleted IS NOT true
  AND age >= 18;
```

## 排序分页 `.order()` / `.limit()` / `.range()` {#pagination}

**Supabase**：

```ts
supabase.from('users')
  .select('*')
  .order('created_at', { ascending: false })
  .range(10, 19); // 第 2 页，每页 10 条
```

**MySQL**：

```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10 OFFSET 10;
```

## 获取单行 `.single()` / `.maybeSingle()` {#single-maybeSingle}

**Supabase**：

```ts
supabase.from('config')
    .select('value')
    .eq('key', 'site_title')
    .single();
```

- `.single()`：返回一行，0 或多行都会报错
- `.maybeSingle()`：0 或 1 行都可接受

## 插入数据 `.insert()` {#insert}

**Supabase**：

```ts
await supabase.from('users').insert({ name: 'Tom', age: 30 });
```

**MySQL**：

```sql
INSERT INTO users (name, age) VALUES ('Tom', 30);
```

- 可插入多个：`insert([{...}, {...}])`
- 默认返回插入后的数据

## 更新数据 `.update()` {#update}

**Supabase**：

```ts
await supabase.from('users')
  .update({ age: 35 })
  .eq('id', 1);
```

**MySQL**：

```sql
UPDATE users SET age = 35 WHERE id = 1;
```

## 删除数据 `.delete()` {#delete}

**Supabase**：

```ts
await supabase.from('users')
  .delete()
  .eq('id', 1);
```

**MySQL**：

```sql
DELETE FROM users WHERE id = 1;
```

## 原始 SQL 支持（服务端） {#raw-sql}

Supabase 控制台支持原始 SQL 查询，但 **前端不支持直接执行原生 SQL**。

推荐通过 RPC 函数调用：

```ts
await supabase.rpc('get_user_stats', { user_id: 123 });
```

## 错误处理 `.throwOnError()` {#error-handling}

```ts
supabase.from('users').select('*').throwOnError();
```

等价于：

```ts
const { data, error } = await supabase.from('users').select('*');
if (error) throw error;
```

## 所有查询方法对照表 {#api-table}

| Supabase 方法      | SQL 对应         | 说明                       |
| ------------------ | ---------------- | -------------------------- |
| `.select()`        | `SELECT`         | 查询字段                   |
| `.eq()`            | `=`              | 等于                       |
| `.neq()`           | `!=`             | 不等于                     |
| `.gt()`, `.lt()`   | `>`, `<`         | 比较运算                   |
| `.gte()`, `.lte()` | `>=`, `<=`       | 比较运算                   |
| `.in()`            | `IN`             | 多值匹配                   |
| `.like()`          | `LIKE`           | 模糊匹配                   |
| `.ilike()`         | `ILIKE`          | 忽略大小写匹配（Postgres） |
| `.order()`         | `ORDER BY`       | 排序                       |
| `.limit()`         | `LIMIT`          | 限制数量                   |
| `.range()`         | `OFFSET + LIMIT` | 分页                       |
| `.or()`            | `OR`             | 或条件                     |
| `.not()`           | `NOT`            | 非条件                     |
| `.filter()`        | 通用 `WHERE`     | 动态运算符传入             |
| `.single()`        | 1 行限制         | 多行或 0 行报错            |
| `.maybeSingle()`   | 最多 1 行        | 宽容版本                   |
| `.insert()`        | `INSERT`         | 插入数据                   |
| `.update()`        | `UPDATE`         | 修改数据                   |
| `.delete()`        | `DELETE`         | 删除数据                   |
| `.throwOnError()`  | 无               | 自动抛出错误               |

## 最佳实践建议 {#best-practices}

- 所有操作均为异步 `await`，不可漏写
- 前端使用匿名 key，受限于 Row Level Security（RLS）
- 服务端使用 `service_role` key，可访问所有数据
- 建议封装为统一查询服务（如 NestJS Service）
- 支持链式调用，可组合多个条件与功能

## 总结 {#summary}

Supabase 的客户端 API 提供了一个现代、类型安全、SQL 等价的数据库操作方式，无需写原生 SQL 就能完成绝大多数业务逻辑。