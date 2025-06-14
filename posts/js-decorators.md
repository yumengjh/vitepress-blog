---
title: 关于 JavaScript 装饰器的使用
date: 2025-06-13
category: Note
tags: 
    - JavaScript
    - TypeScript
description: 装饰器用来增强 JavaScript 类的功能，也可以用于函数和属性。它们在 Nest.js 中被广泛使用，提供了一种优雅的方式来添加元数据和行为到类的成员上。
outline: [2,5]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
---

# 装饰器

[TS装饰器](/posts/ts-tutorial.html#decorators)


| 装饰器类型 | 主要作用 | 能否改变原代码行为？ | 常见场景 |
| :--- | :--- | :--- | :--- |
| **方法装饰器** | 增强方法功能 | **能**，通过修改 `descriptor.value` | 日志、计时、权限检查 |
| **类装饰器** | 增强整个类 | **能**，通过修改或替换构造函数 | 添加静态属性、实现单例 |
| **访问器装饰器** | 增强 Getter/Setter | **能**，通过修改 `descriptor.get/set` | 数据验证、确认操作 |
| **属性装饰器** | 收集属性信息 | **不能** | 标记元数据（如序列化） |
| **参数装饰器** | 收集参数信息 | **不能** | 标记元数据（如依赖注入、验证） |
