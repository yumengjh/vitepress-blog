---
title: Petite-Vue是Vue的替代发行版，它更小，更快，更简单
date: 2025-05-20
category: Note
tags: 
    - Vue
description: 它非常适合进行二次开发，制作出自己想要的[轮子]，本文主要介绍Petite Vue的API
outline: [2,3]
---

# Petite-Vue API

## 核心 API

### createApp(initialData?: any)

创建 Petite Vue 应用实例。

```js
// 基础用法
const app = createApp()

// 传入初始数据
const app = createApp({
  count: 0,
  message: 'Hello'
})

// 传入自定义分隔符
const app = createApp({
  $delimiters: ['${', '}']
})

// 传入全局状态
const store = reactive({
  count: 0,
  increment() {
    this.count++
  }
})
const app = createApp({
  store
})
```

### app.mount(el?: string | Element | null)

挂载应用。

```js
// 挂载到指定选择器
app.mount('#app')

// 挂载到指定元素
app.mount(document.querySelector('#app'))

// 挂载到整个文档
app.mount()

// 挂载到指定 v-scope 元素
app.mount('[v-scope]')

// 挂载到多个根元素
app.mount('.vue-root1')
app.mount('.vue-root2')
```
>[!tip]
> 挂载到多个根元素时，需要多次调用 `app.mount` 方法。
> 如果需要上下文隔离，需要使用不同的应用实例进行挂载，否则将共享同一个上下文。

### app.unmount()

卸载应用,清理所有副作用。

```js
// <button @click.once="unmount">卸载应用</button>
const app = createApp({
    // 将卸载方法添加到应用数据中
    unmount() {
        app.unmount()
        console.warn('应用已卸载，数据将不再响应！')
    }
})
```

### app.directive(name: string, def?: Directive)

注册或获取自定义指令。

[自定义指令完整API](#自定义指令)

## 内置指令

### v-scope

定义作用域。

```html
<!-- 基础用法 -->
<div v-scope="{ count: 0 }">
  {{ count }}
</div>

<!-- 空作用域 -->
<div v-scope>
  {{ count }}
</div>

<!-- 使用模板 -->
<div v-scope="{ $template: '#tpl' }">
</div>

<!-- 作用域继承 -->
<div v-scope="{ parent: 'value' }">
  <div v-scope="{ child: 'value' }">
    {{ parent }} {{ child }}
  </div>
</div>
```

### v-if / v-else-if / v-else

条件渲染。

```html
<div v-scope="{ show: true }">
  <p v-if="show">显示</p>
  <p v-else-if="type === 'A'">A类型</p>
  <p v-else>其他</p>
</div>
```

### v-for

列表渲染。

```html
<!-- 数组遍历 -->
<div v-scope="{ items: ['a', 'b', 'c'] }">
  <div v-for="item in items">{{ item }}</div>
</div>

<!-- 对象遍历 -->
<div v-scope="{ obj: { a: 1, b: 2 } }">
  <div v-for="(value, key) in obj">
    {{ key }}: {{ value }}
  </div>
</div>

<!-- 数字遍历 -->
<div v-for="i in 5">{{ i }}</div>

<!-- 使用索引 -->
<div v-for="(item, index) in items">
  {{ index }}: {{ item }}
</div>

<!-- 解构 -->
<div v-for="{ id, name } in users">
  {{ id }}: {{ name }}
</div>

<!-- 使用 key -->
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>
```

### v-bind / :

属性绑定。

```html
<!-- 基础绑定 -->
<div :class="cls"></div>
<div :style="style"></div>

<!-- 对象绑定 -->
<div v-bind="{ id: id, class: cls }"></div>

<!-- 修饰符 -->
<div :class.camel="cls"></div>

<!-- 动态属性名 -->
<div :[key]="value"></div>

<!-- 布尔属性 -->
<button :disabled="isDisabled">按钮</button>

<!-- 特殊属性处理 -->
<div :class="['base', { active: isActive }]"></div>
<div :style="{ color: textColor, fontSize: size + 'px' }"></div>
```

### v-on / @

事件绑定。

```html
<!-- 基础用法 -->
<button @click="handleClick">点击</button>

<!-- 修饰符 -->
<button @click.stop="handleClick">阻止冒泡</button>
<button @click.prevent="handleClick">阻止默认</button>
<button @click.capture="handleClick">捕获</button>
<button @click.self="handleClick">自身</button>
<button @click.once="handleClick">一次</button>
<button @click.passive="handleClick">不阻止默认</button>

<!-- 按键修饰符 -->
<input @keyup.enter="handleEnter">
<input @keyup.ctrl="handleCtrl">

<!-- 鼠标修饰符 -->
<button @click.left="handleLeft">左键</button>
<button @click.middle="handleMiddle">中键</button>
<button @click.right="handleRight">右键</button>

<!-- 动态事件名 -->
<button @[eventName]="handler"></button>

<!-- 内联语句 -->
<button @click="count++">增加</button>
```

### v-model

双向绑定。

```html
<!-- 文本输入 -->
<input v-model="text">

<!-- 复选框 -->
<input type="checkbox" v-model="checked">

<!-- 单选框 -->
<input type="radio" v-model="picked" value="one">

<!-- 选择框 -->
<select v-model="selected">
  <option value="A">A</option>
  <option value="B">B</option>
</select>

<!-- 修饰符 -->
<input v-model.trim="text">
<input v-model.number="number">
<input v-model.lazy="text">

<!-- 自定义值 -->
<input 
  type="checkbox"
  v-model="toggle"
  :true-value="yes"
  :false-value="no"
>
```

### v-show

条件显示。

```html
<div v-show="visible">显示/隐藏</div>
```

### v-html

HTML 内容。

```html
<div v-html="html"></div>
```

### v-text

文本内容。

```html
<div v-text="text"></div>
```

### v-once

一次性渲染。

```html
<div v-once>{{ message }}</div>
```

### v-pre

跳过编译。

```html
<div v-pre>{{ message }}</div>
```

### v-cloak

隐藏未编译内容。

```html
<div v-cloak>{{ message }}</div>
```

### ref

引用元素。

```html
<div ref="el"></div>
```

 在组件中访问 ref，可以通过 this.$refs.el 在代码中访问这个 DOM 元素

```js
console.log(this.$refs.el)
```

### v-effect

副作用。

```html
<div v-effect="() => console.log(count)"></div>
```

## 生命周期

### @vue:mounted

组件挂载后。

```html
<div @vue:mounted="onMounted"></div>
```

### @vue:unmounted

组件卸载后。

```html
<div @vue:unmounted="onUnmounted"></div>
```

## 全局属性

### $s

将值转换为字符串。

```html
<div>{{ $s(obj) }}</div>
```

### $nextTick

等待下一个 DOM 更新周期。

```js
$nextTick(() => {
  // DOM 已更新
})
```

### $refs

引用集合。

```html
<div v-ref="myRef"></div>
<script>
console.log($refs.myRef)
</script>
```

## 响应式 API

### reactive

创建响应式对象。

```js
import { reactive } from 'petite-vue'

const state = reactive({
  count: 0
})

// 嵌套对象也是响应式的
const nested = reactive({
  user: {
    name: 'John',
    age: 20
  }
})
```

## 调度器 API

### nextTick

等待下一个 DOM 更新周期。

```js
import { nextTick } from 'petite-vue'

nextTick(() => {
  // DOM 已更新
})
```

## 工具函数

### evaluate

计算表达式。

```js
import { evaluate } from 'petite-vue'

const result = evaluate(scope, 'count + 1')
```

### execute

执行代码。

```js
import { execute } from 'petite-vue'

execute(scope, 'count++')
```

## 最佳实践

1. **作用域隔离**
   - 使用 `v-scope` 明确标记由 petite-vue 控制的区域
   - 避免在不需要的地方使用 petite-vue
   - 合理使用作用域继承

2. **性能优化**
   - 避免在大型 DOM 树上使用 petite-vue
   - 使用 `v-once` 处理静态内容
   - 合理使用计算属性缓存结果
   - 使用 `v-show` 代替频繁的 `v-if`

3. **安全性**
   - 注意 XSS 风险，不要在不信任的 HTML 上使用 petite-vue
   - 使用显式挂载目标限制 petite-vue 的作用范围
   - 谨慎使用 `v-html`

4. **代码组织**
   - 将复杂逻辑抽离到独立函数
   - 使用组件函数复用逻辑
   - 保持模板简洁清晰
   - 合理使用全局状态管理

## 注意事项

1. 生命周期事件需要添加 `vue:` 前缀
2. 不支持以下 Vue 功能:
   - 渲染函数
   - 虚拟 DOM
   - 集合类型的响应式(Map、Set 等)
   - Transition、KeepAlive、Teleport、Suspense
   - `v-for` 深度解构
   - `v-on="object"`
   - `v-is` 和 `<component :is="xxx">`
   - `v-bind:style` 自动前缀

3. 在严格的 CSP 设置中,由于使用 `new Function()`,可能需要使用标准 Vue 并预编译模板。

4. 作用域继承规则:
   - 子作用域可以访问父作用域的属性
   - 子作用域的同名属性会覆盖父作用域
   - 修改子作用域不会影响父作用域

5. 响应式限制:
   - 不支持 Map、Set 等集合类型
   - 数组的某些方法可能不会触发更新
   - 对象属性的添加/删除不会触发更新

## 自定义指令

Petite Vue 支持自定义指令，但接口与 Vue3 不同。**自定义指令的回调只接收一个参数 ctx（上下文对象）**，没有 el、binding 两个参数。

### ctx 对象属性
- `ctx.el`：指令绑定的 DOM 元素
- `ctx.exp`：**原始**表达式字符串（如 v-my-dir="x"，则为 "x"）
- `ctx.arg`：参数（如 v-my-dir:foo，则为 "foo"）
- `ctx.modifiers`：修饰符对象（如 v-my-dir.mod，则为 `{ mod: true }`）
- `ctx.get()`：计算表达式并返回其值
- `ctx.get(expr)`：在当前作用域下计算任意表达式
- `ctx.effect(fn)`：注册响应式副作用，`fn` 会在依赖变化时自动重新执行

### 生命周期
- 指令函数在元素挂载时调用一次。
- 如果你需要响应式地处理表达式的值，**应使用 `ctx.effect`**。
- 指令函数可以返回一个清理函数（可选），在元素卸载时调用。

### 标准用法示例

```js
// 注册自定义指令 v-color
app.directive('color', ctx => {
  // 响应式地设置颜色
  const stop = ctx.effect(() => {
    ctx.el.style.color = ctx.get()
  })
  // 可选：返回清理函数
  return () => {
    stop()
  }
})
```

**清理函数的触发时机**：

- 当使用 v-if 移除元素时

- 当元素被其他方式移除时

- 当指令所在的组件被卸载时

```html
<div v-scope="{ color: 'red' }">
  <p v-color="color">这段文字会变色</p>
  <button @click="color = color === 'red' ? 'blue' : 'red'">切换颜色</button>
</div>
```

### 带参数和修饰符示例

```js
app.directive('color', ctx => {
  ctx.effect(() => {
    if (ctx.arg === 'bg') {
      ctx.el.style.backgroundColor = ctx.get()
    } else {
      ctx.el.style.color = ctx.get()
    }
    if (ctx.modifiers.bold) {
      ctx.el.style.fontWeight = 'bold'
    }
  })
  return () => {
    ctx.el.style.color = ''
    ctx.el.style.backgroundColor = ''
    ctx.el.style.fontWeight = ''
  }
})
```

```html
<p v-color:bg.bold="color">带参数和修饰符</p>
```

### 说明
- 不要使用 Vue3 的 el、binding 两参数写法。
- 推荐所有副作用都用 ctx.effect 注册，清理用返回函数。

