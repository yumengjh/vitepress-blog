---
title: Reactivity在petite-vue中的相关API
date: 2025-05-26
category: Note
tags: 
    - Vue
description: 读petite-vue源码时遇到Reactivity的一些记录
outline: [2,3]
draft: false
sticky: false
done: false
gridPaper: false
handwriting: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
---

# Reactivity

## reactive

用于创建响应式对象

```js
import { reactive } from '@vue/reactivity'

const state = reactive({
  count: 0,
  message: 'Hello',
  nested: {
    value: 'Nested value'
  }
})

// 响应式更新
state.count++ // 会自动触发依赖更新
state.message = 'Updated' // 同样会触发更新
state.nested.value = 'New nested value' // 深层属性也是响应式的
```

- 返回一个 Proxy 代理对象
- 支持深层响应式（嵌套对象也会被转换为响应式）
- 修改属性会自动触发依赖更新

## effect

用于响应式副作用

```js
import { effect as rawEffect, reactive } from '@vue/reactivity'	// 重命名导入

const state = reactive({ count: 0 })

// 创建一个 effect
const runner = rawEffect(() => {
  console.log(`Count is: ${state.count}`)
})

state.count++ // 控制台会输出 "Count is: 1"

// 停止 effect
runner.stop() // 之后 state.count 的变化不会再触发 effect
```

**高级用法**

```js
const runner = rawEffect(() => {
  console.log(state.count)
}, {
  // 调度函数，可以控制 effect 的执行时机
  scheduler(effect) {
    // 例如使用 requestAnimationFrame 来批处理更新
    requestAnimationFrame(effect)
  },
  // 延迟执行
  lazy: true
})

// 手动执行
runner()
```

**关于高级参数解析**：

```js
rawEffect(fn, {
  scheduler: () => queueJob(e)
})
```

`scheduler` 的作用

- **默认行为**：没有 scheduler 时，依赖变更会**立即执行** effect 函数
- **使用 scheduler 后**：依赖变更时，会执行 scheduler 而不是直接执行 effect
- **控制权转移**：将 effect 的执行时机交给开发者控制

参数详解：

| 参数                | 类型                               | 作用                               |
| ------------------- | ---------------------------------- | ---------------------------------- |
| `fn`                | `() => T`                          | 要执行的副作用函数                 |
| `options.scheduler` | `(effect: ReactiveEffect) => void` | 调度函数，决定如何/何时执行 effect |

关于`queueJob`通过 `Promise.resolve()` 确保在下一个微任务执行

`if (!queue.includes(job)) queue.push(job)`去重机制

```txt
状态变更 → scheduler 调用 → queueJob → 微任务队列 → flushJobs
```

**示例**：

```js
const state = reactive({ count: 0 })

const e = rawEffect(() => {
  console.log('Running effect:', state.count)
}, {
  scheduler: () => queueJob(e)	// 引用赋值（触发时e才有值）
})

state.count++  // 修改1
state.count++  // 修改2
```

#### 执行时序：

1. **同步阶段**：

   - 两次 `state.count++` 触发 setter
   - 每次 setter 调用 scheduler → `queueJob(e)`
   - 由于去重机制，`e` 只会被添加一次到队列

2. **微任务阶段**：

   ```js
   nextTick(flushJobs) → 执行队列中的所有 job
   ```

   - 实际执行的是 `e()` (即原始 effect 函数)
   - 最终只输出一次：`"Running effect: 2"`



## ReactiveEffectRunner

副作用运行器

这是 `effect` 函数的返回类型，表示一个可控制的副作用运行实例。

```js
interface ReactiveEffectRunner<T = any> {
  (): T
  effect: ReactiveEffect
  stop: () => void
}
```

```js
const runner = rawEffect(() => {
  // 副作用逻辑
})

// 1. 可以像函数一样调用
runner()

// 2. 可以停止响应式追踪
runner.stop()

// 3. 可以访问底层 effect 实例
console.log(runner.effect)
```

## 追踪依赖

当你用 `reactive()` 创建一个响应式对象时，Vue 实际上创建了一个 Proxy 代理对象，这个代理会拦截所有属性访问(get)和修改(set)操作

effect 执行时的依赖收集：

```js
const runner = rawEffect(() => {
  console.log(`Count is: ${state.count}`)
  //         ^ 这里访问了 state.count
})
```

当 effect 函数首次执行时，每次访问响应式属性(如 `state.count`)，都会触发 getter，getter 会检查当前是否有活跃的 effect (即正在执行的 effect)，如果有，就会把这个 effect 记录为该属性的依赖

```json
{
  target: { count: 0 },  // 原始对象
  key: 'count',         // 属性名
  dep: [effect1, effect2] // 依赖这个属性的所有 effect
}
```

**触发**：

```js
state.count++ // 触发 setter
```

修改属性值时，会触发 setter，setter 会查找这个属性对应的所有 effect，重新执行这些 effect

**动态依赖**：每次 effect 执行都会重新收集依赖，所以分支代码也能正常工作

```js
rawEffect(() => {
  if (state.condition) {
    console.log(state.a) // 只有 condition 为 true 时才依赖 a
  } else {
    console.log(state.b) // 否则依赖 b
  }
})
```

**推荐做法**：

每个逻辑关注点应该有自己独立的 effect，而不是把所有副作用写在一个大 effect 中

```js
// 好的做法 - 分离关注点
const countLogger = rawEffect(() => {
  console.log('Count:', state.count)
})

const userLogger = rawEffect(() => {
  console.log('User:', state.user)
})

// 不好的做法 - 所有副作用混在一起
const megaEffect = rawEffect(() => {
  console.log('Count:', state.count)
  console.log('User:', state.user)
  // 其他不相关的逻辑...
})
```

