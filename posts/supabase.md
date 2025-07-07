---
title: Supabase 踩坑手记，上手实践，注意事项
date: 2025-07-07
category: Note
tags: 
    - Supabase
description: 涵盖初学记录、专题整理、踩坑复盘
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

::: details 目录
[[toc]]
:::

# Supabase

## Supabase 中的 3 类访问者

| 访问者类型             | 用途               | 使用密钥/令牌              | 对应角色        | 是否受 RLS 限制 | 场景示例                   |
| ---------------------- | ------------------ | -------------------------- | --------------- | --------------- | -------------------------- |
| 🛡️ 服务端（超级管理员） | 后端/脚本/部署工具 | `service_role key`         | 无（绕过 RLS）  | ❌ 不受限制      | 后端服务加载配置、管理数据 |
| 👤 登录用户             | 已登录的普通用户   | `access_token` 登录令牌    | `authenticated` | ✅ 遵守 RLS      | 用户查看个人信息、业务操作 |
| 🧍‍♂️ 游客                | 未登录访问者       | `anon key`（匿名访问密钥） | `anon`          | ✅ 遵守 RLS      | 公共页面加载、注册请求等   |

 **服务端（Super Admin）**

- 用 `service_role key` 来访问 Supabase 的 REST 或客户端
- **不会执行 Row-Level Security (RLS)**，权限最大
- 不建议前端使用（泄露就等于数据库裸奔）
- NestJS / Node 后端**应该用它**

**游客（anon）**

- 使用 `anon key`，**适合前端未登录状态访问**
- 角色为 `anon`
- 如果你希望“允许任何人读取一些数据”，就需要为 `anon` 创建 RLS Policy

**已登录用户（authenticated）**

- 用户通过 `supabase.auth.signInWithPassword()` 登录成功
- 之后客户端会获得一个 `access_token`
- 后续 API 请求会自动带上 `Authorization: Bearer <access_token>`，Supabase 就知道你是登录用户
- 角色为 `authenticated`
- 可以基于此做更精细的权限控制（只允许访问自己的数据等）

 **注意**：Supabase 不支持自定义角色字段（role 只是 JWT claim）

Supabase 本身只识别两种用户角色：

- `anon`
- `authenticated`

想要实现 **“管理员”、“普通用户”** 这样的**自定义角色权限**，你可以用这种方式：

```ts
-- users 表中加一个 role 字段
-- 然后在 RLS policy 中判断 auth.uid() 所对应用户的 role
```

示例 RLS：

```sql
create policy "only admins can see this"
on some_table
for select
to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);
```

 **在控制台哪里配置权限？**

你可以在 Supabase 控制台中：

1. 打开 `Table Editor` → 点某个表
2. 点击右上角的 `RLS` 开关（默认关闭，建议开启）
3. 添加 Row Level Policies（行级安全策略），根据 `anon` 或 `authenticated` 配置访问条件

**总结**：

Supabase 实际上只有两类**RLS角色**：`anon` 和 `authenticated`。服务端使用 `service_role` 密钥是“超级权限模式”，绕过所有规则，适合后端。
想实现更复杂的“角色权限”，请通过数据库字段 + RLS Policy 手动实现。