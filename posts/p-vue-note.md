---
title: 阅读Petite-vue时的一些函数解析
date: 2025-05-26
category: Note
tags: 
    - Vue
description: 阅读Petite-vue时的一些函数解析。
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

# 源码解析

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

## createScopedContext

用于创建**作用域上下文**的核心函数，组件作用域继承机制

创建一个新的上下文环境，该环境：

- **继承父作用域**：可以访问父上下文的所有属性
- **拥有本地数据**：可以添加新的响应式属性
- **智能属性分配**：自动判断属性应该存在父级还是当前作用域

```javascript
const parent = createContext({ count: 1 })
const child = createScopedContext(parent, { message: 'hello' })

// child 可以访问 parent.count
// 新增属性会根据规则自动确定存放位置
```

 **原型链继承**

```javascript
const parentScope = ctx.scope
const mergedScope = Object.create(parentScope) // 原型链继承
```

- 使用 `Object.create` 建立原型链，新作用域 `__proto__` 指向父作用域
- 实现属性查找的向上委托（类似 JavaScript 的原型链查找）

**本地属性合并**

```javascript
Object.defineProperties(mergedScope, Object.getOwnPropertyDescriptors(data))
```

- 将传入的 `data` 对象的所有属性（包括 getter/setter）复制到新作用域
- 保持属性描述符（如 `configurable`, `enumerable` 等）不变

 **特殊属性处理**

```javascript
mergedScope.$refs = Object.create(parentScope.$refs)
```

- 单独处理 `$refs` 属性，确保每个作用域有独立的 refs 存储
- 仍然保持原型链继承关系

**响应式代理**

```javascript
const reactiveProxy = reactive(
  new Proxy(mergedScope, {
    set(target, key, val, receiver) {
      if (receiver === reactiveProxy && !target.hasOwnProperty(key)) {
        return Reflect.set(parentScope, key, val)
      }
      return Reflect.set(target, key, val, receiver)
    }
  })
)
```

**关键点**：

- 双层代理：外层的 `reactive()` 处理响应式，内层的 `Proxy` 处理作用域逻辑
- 智能属性设置规则：
  - 当设置的属性**不存在于当前作用域**时，写入父作用域
  - 通过 `receiver === reactiveProxy` 确保是直接操作当前代理对象
  - 通过 `target.hasOwnProperty(key)` 检查属性归属

**方法绑定**

```javascript
bindContextMethods(reactiveProxy)
```

确保作用域中的方法具有正确的 `this` 上下文

**返回新上下文**

```javascript
return {
  ...ctx,          // 复制原有上下文配置
  scope: reactiveProxy // 替换为新的作用域
}
```

![image-20250527182842769](https://image.yumeng.icu/2025-05-27%2F182847.png)

**属性访问规则**

| 操作类型             | 处理方式       |
| :------------------- | :------------- |
| 读取已有属性         | 沿原型链查找   |
| 设置已有属性         | 修改所属作用域 |
| 设置新属性           | 写入当前作用域 |
| 设置继承属性(非自有) | 写入父作用域   |

**性能优化**

- 使用 `Object.getOwnPropertyDescriptors` 一次性复制所有属性
- 通过 `hasOwnProperty` 快速判断属性归属
- 响应式系统只在最外层包装一次

## bindContextMethods

这个函数的作用是确保作用域(scope)中所有方法的 `this` 指向正确。

一句话就是：绑定之后能够确保方法被赋值后其中的`this`依然指向其原始的作用域，而不是被赋值后所在的作用域。

不绑定`this`的情况：

```javascript
const scope = {
  name: 'JSS',
  greet() {
    console.log(`Hello from ${this.name}`)
  }
}

const greetFn = scope.greet
greetFn() // 输出: "Hello from undefined" (this指向全局或undefined)
```

绑定后：

```javascript
bindContextMethods(scope)
const greetFn = scope.greet
greetFn() // 输出: "Hello from JSS" (this正确指向scope)
```

`this` 的默认指向规则：

| 调用方式     | `this` 指向        | 示例                          |
| :----------- | :----------------- | :---------------------------- |
| 直接方法调用 | 所属对象           | `obj.method()`                |
| 函数引用调用 | 全局对象/undefined | `const fn = obj.method; fn()` |
| 作为回调传递 | 取决于调用方       | `setTimeout(obj.method, 100)` |
| 构造函数调用 | 新创建的对象       | `new Constructor()`           |

在Petite-vue中的场景：

```html
<button @click="increment">Count: {{ count }}</button>
```

- 当点击事件发生时，`increment` 方法会被作为回调调用
- 没有绑定则 `this` 会丢失原始上下文

```javascript
const runner = effect(() => {
  console.log(this.count)
})
```

上述代码中的this需要**始终**指向scope

**实现原理分析**

```javascript
scope[key] = scope[key].bind(scope)
```

- 创建一个新函数，其 `this` 永久绑定到 `scope`
- 保证无论以何种方式调用，`this` 始终一致

## with语句

在`toFunction`函数中使用到了with相关语法，回顾一下相关知识

with 语句会将指定对象添加到作用域链的前端，这样在 with 块内部可以直接访问该对象的属性，而不需要使用对象名前缀。

- with($data) 将 $data 对象的所有属性提升到当前作用域

- 在 with 块内部，可以直接使用 $data 的属性名，而不需要 $data. 前缀

```javascript
// 数据对象
const data = {
    name: '张三',
    age: 25,
    message: 'Hello World'
}

// 生成的函数示例
function anonymous($data, $el) {
    with($data) {
        return name;  // 等价于 $data.name
    }
}

function anonymous($data, $el) {
    with($data) {
        return age + 1;  // 等价于 $data.age + 1
    }
}

function anonymous($data, $el) {
    with($data) {
        return message.toUpperCase();  // 等价于 $data.message.toUpperCase()
    }
}
```

## evaluate

传入**数据对象，表达式，元素**，返回**表达式计算后的值**

```javascript
scope: Proxy(Object) {$delimiters: Array(2), str: 'hello world', message: 'hello world'...}

exp: return("局部状态："+$s( str ))
                      
el：#text	// 文本节点
                      
result：局部状态：hello world
```

**toFunction**函数，上述代码的返回值

```javascript
fn ƒ anonymous($data,$el
) {
with($data){return("局部状态："+$s( str ))}
}
```

通过执行这个函数将数据进行替换后返回

原本的函数中，`el`值并没有用到，后续我进行扩展后：

```javascript
const toFunction = (exp: string): Function => {
    try {
        return new Function(`$data`, `$el`, `with($data){${exp}}`)	// [!code --]
        // [!code ++]
        return new Function(`$data`, `$el`, `
    // [!code ++]
      with($data){
      // [!code ++]
        const el = $el;
        // [!code ++]
        ${exp}
        // [!code ++]
      }
      // [!code ++]
    `)
    } catch (e) {
        console.error(`表达式 ${exp} 中出错：${(e as Error).message}`)
        return () => {}
    }
}
```

可以在表达式中使用

**访问元素属性：**

```html
<div v-text="el.tagName">元素标签名</div>
<div v-text="el.id">元素ID</div>
<div v-text="el.className">元素类名</div>
```

**操作元素样式：**

```html
<button @click="el.style.color = 'red'">变红</button>
<button @click="el.classList.add('active')">添加类</button>
```

**访问元素数据**：

```html
<div v-text="el.dataset.message">数据属性</div>
```

**DOM 操作：**

```html
<button @click="el.parentNode.removeChild(el)">删除自己</button>
<button @click="el.innerHTML = '已更新'">更新内容</button>
```

**事件处理：**

```html
<button @click="el.dispatchEvent(new Event('custom'))">触发自定义事件</button>
```

**其他操作**

...

## ref

在**ref**指令中**prevRef**变量的作用是跟踪上一次的引用名称，主要用于处理引用名称变化的情况。

```javascript
if (prevRef && ref !== prevRef) {
    delete $refs[prevRef]
}
```

当元素的 ref 属性值发生变化时，需要删除旧的引用，避免内存泄漏，例如：从 ref="counter1" 变成 ref="counter2"

清理工作：

```javascript
return () => {
    prevRef && delete $refs[prevRef]
}
```

上述**清理函数**会被 petite-vue 的响应式系统**自动调用**

- 当 v-scope 指令被移除时

- 当元素从 DOM 中移除时

- 当组件被销毁时

```html
<div v-if="show" ref="myRef">
    <!-- 当 show 变为 false 时，这个 div 会被移除 -->
    <!-- 此时清理函数会自动触发 -->
</div>
```

**关于为什么是自动的：**

- 这是 petite-vue 的响应式系统的一部分

- 指令的清理函数会被注册到响应式系统中

- 当相关元素或组件被销毁时，系统会自动调用这些清理函数

**总结：**不需要手动调用这个清理函数，它是由 petite-vue 的响应式系统自动管理的。这种机制确保了资源的正确清理，防止内存泄漏。

```html
<!-- 初始状态 -->
<div ref="counter1">...</div>

<!-- 动态改变 ref -->
<div :ref="dynamicRef">...</div>
```

- 当 dynamicRef 的值从 "counter1" 变为 "counter2" 时

- prevRef 会记录 "counter1"

- 然后从 $refs 中删除旧的引用

**主要是：**

- 防止引用堆积

- 确保 $refs 对象中只包含当前有效的引用

- 避免内存泄漏

## processDirective

**关于replace** ：

```js
string.replace(正则表达式, 替换函数)
```

**替换函数的参数**：

```js
(完整匹配, 第一个捕获组, 第二个捕获组, ...) => {
    // 返回要替换成的内容
}
```

- 第一个参数 _：完整匹配的字符串（这里用 _ 表示不使用这个参数）

- 第二个参数 m：第一个捕获组的内容（这里是想要的修饰符名称）

为什么用 `_`：

- `_` 是一个常见的约定，表示"这个参数我们不会使用"

- 因为我们需要的是捕获组 m，而不是完整匹配

```js
// 例如对于 v-on:click.prevent
raw.replace(modifierRE, (_, m) => {
    // _ 是完整匹配，m 是捕获组（修饰符名称）
    // 如果 modifiers 不存在，则初始化为空对象
    (modifiers || (modifiers = {}))[m] = true
    // 返回空字符串，相当于删除这个修饰符
    return ''
})
```

例子：

```html
<!-- 原始指令 -->
v-on:click.prevent.stop

<!-- 处理后 -->
// raw 变成 "v-on:click"
// modifiers 变成 { prevent: true, stop: true }
```

总结：

- 找到指令中的修饰符（如 .prevent）
- 提取修饰符名称（如 prevent）
- 将这个修饰符标记为 true
- 从原始字符串中删除这个修饰符（替换为空）

