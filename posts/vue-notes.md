---
title: 回顾Vue.js的一些笔记
date: 2025-06-14
category: Note
tags: 
    - Vue
description: 主要是回顾Vue.js，太久不用了，忘记了很多东西，所以写点笔记记录一下。
outline: [2,3]
draft: false
sticky: false
cbf: true
zoomable: true
publish: true
AutoAnchor: false
aside: false
---

# Vue.js 小记

::: details 目录

[[toc]]

:::

##  Import maps

```js
import { createApp } from 'vue'
```

[导入映射表 (Import Maps)](https://caniuse.com/import-maps)用于在浏览器中更好地管理 JavaScript 模块的导入路径。

```html {12}
<script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
</script>

<div id="app">{{ message }}</div>

<script type="module">
  import { createApp, ref } from 'vue'

  createApp({
    setup() {
      const message = ref('Hello Vue!')
      return {
        message
      }
    }
  }).mount('#app')
</script>
```

上面的代码中，导入的vue模块路径被映射到一个CDN地址。

## 全局错误捕获

应用实例会暴露一个 `.config` 对象允许我们配置一些应用级的选项，例如定义一个应用级的错误处理器，用来捕获**所有子组件上的错误**：

```js
app.config.errorHandler = (err) => {
  /* 处理错误 */
}
```

## 绑定

```vue
<div v-bind:id="id"></div>
<div :id="id"></div>
<div :id></div>
<div v-bind:id></div>
```

上面四种写法的效果是一样的。

**动态绑定多个值**：

```js
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper',
  style: 'background-color:green'
}
```

**注意**：不带参数的 `v-bind`

```vue
<div v-bind="objectOfAttrs"></div>
```

**受限的全局访问**：

模板中的表达式将被沙盒化，仅能够访问到[有限的全局对象列表](https://github.com/vuejs/core/blob/main/packages/shared/src/globalsAllowList.ts#L3)。该列表中会暴露常用的内置全局对象，比如 `Math` 和 `Date`。

```js
const GLOBALS_ALLOWED =
  'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
  'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
  'Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol'
```

没有**显式包含在列表中的全局对象将不能在模板内表达式中访问**，例如用户附加在 `window` 上的属性。然而，你也可以自行在 [`app.config.globalProperties`](https://cn.vuejs.org/api/application.html#app-config-globalproperties) 上显式地添加它们，供所有的 Vue 表达式使用。

**动态参数**：

```vue
<a v-bind:[attributeName]="url"> ... </a>
<a v-on:[eventName]="doSomething"> ... </a>
```

`attributeName` 会作为一个 JavaScript 表达式被动态执行

动态参数中表达式的值应当是一个**字符串**，或者是 `null`。特殊值 `null` 意为**显式移除该绑定**。其他非字符串的值会触发警告。

![](https://image.yumeng.icu/2025-06-15%2F180020.png){no-zoom}

## 样式绑定

**样式对象绑定**：

```js
const classObject = reactive({
  active: true,
  'text-danger': false
})
```

```vue
<div :class="classObject"></div>
```

或者绑定一个返回对象的[计算属性](https://cn.vuejs.org/guide/essentials/computed.html)

**内联样式**：

```js
const activeColor = ref('red')
const fontSize = ref(30)
```

```vue
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```

直接绑定一个样式对象

```js
const styleObject = reactive({
  color: 'red',
  fontSize: '30px'
})
```

```vue
<div :style="styleObject"></div>
```

## v-for中的key

Vue的DOM更新策略是**就地更新**，这意味着当通过V-for渲染元素后，当数据发生顺序变化，但是DOM不会发生变化，只会就地更新每个元素。

如果想让Vue跟踪每个节点的标识，从而重用和重新排序现有的元素，你需要为每个元素对应的块提供一个唯一的 `key` 属性

> **官网的一句话**：默认模式是高效的，但只适用于列表渲染输出的结果不依赖子组件状态或者临时 DOM 状态 (例如表单输入值) 的情况。

 "**不依赖子组件状态**" 的意思是：如果你列表中的每一个子组件实例都有自己独立的、内部维护的状态（比如表单输入值、组件内部的选中状态、展开/收起状态等），那么当列表顺序变化或有增删时，**没有 `key` 会导致这些内部状态被错误地复用，从而出现 Bug**。

 "**临时 DOM 状态**" 的意思是：如果你列表中的元素是表单控件，并且用户可能直接在这些控件上进行输入或操作，那么当列表顺序变化或有增删时，**没有 `key` 会导致 Vue 复用带有旧的临时 DOM 状态的元素，从而出现视图与数据不一致的问题**。

**Key的使用场景**：渲染的列表项是动态的，即会发生增加，删除，重排等事件，并且这些列表项包括：子组件，表单元素等，就应该使用`key`，**并且确保 `key` 是每个列表项独一无二的标识**。

推荐在任何可行的时候为 `v-for` 提供一个 `key` attribute，**除非所迭代的 DOM 内容非常简单** (例如：不包含组件或有状态的 DOM 元素)，或者你想有意采用默认行为来提高性能。

## 事件

关于按钮修饰符可以直接使用 [`KeyboardEvent.key`](https://developer.mozilla.org/zh-CN/docs/Web/API/UI_Events/Keyboard_event_key_values) 暴露的按键名称作为修饰符，但需要转为 kebab-case 形式。

```vue
<input @keyup.page-down="onPageDown" />
```

## 侦听器

侦听器可以监听的数据源可以是：ref（包括计算属性），一个响应式对象、一个 [getter 函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get#description)、或多个数据源组成的数组。

注意，你不能直接侦听**响应式对象的属性值**，需要写成getter函数：

```js
// 提供一个 getter 函数
watch(
  () => obj.count,
  (count) => {
    console.log(`Count is: ${count}`)
  }
)
```

**深层侦听器**：直接给 `watch()` 传入一个响应式对象，会隐式地创建一个**深层侦听器**，该回调函数在所有嵌套的变更时都会被触发：

相比之下，一个返回响应式对象的 getter 函数，**只有在返回不同的对象时（比如整个对象被替换）**，才会触发回调，不过可以显式地加上 `deep` 选项，强制转成深层侦听器，`deep` 选项还可以是一个数字，表示最大遍历深度

在 `setup()` 或 `<script setup>` 中用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并且会在宿主组件卸载时自动停止。因此，在大多数情况下，你无需关心怎么停止一个侦听器。如果用异步回调创建一个侦听器，那么它不会绑定到当前组件上，你必须手动停止它，以防内存泄漏。如下方这个例子：

```vue
<script setup>
import { watchEffect } from 'vue'

// 它会自动停止
watchEffect(() => {})

// ...这个则不会！
setTimeout(() => {
  watchEffect(() => {})
}, 100)
</script>
```

要手动停止一个侦听器，请调用 `watch` 或 `watchEffect` 返回的函数：

需要异步创建侦听器的情况很少，请尽可能选择同步创建。如果需要等待一些异步数据，你可以使用条件式的侦听逻辑：

```js
// 需要异步请求得到的数据
const data = ref(null)

watchEffect(() => {
  if (data.value) {
    // 数据加载后执行某些操作...
  }
})
```

## ref

ref允许我们在一个特定的 DOM 元素或子组件实例被**挂载后**，获得对它的直接引用。

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// 第一个参数必须与模板中的 ref 值匹配
const input = useTemplateRef('my-input')

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="my-input" />
</template>
```

## 组件

### props

```js
const props = defineProps({
    title: {
        rtype: String,
        required: false,
        default: 'Default Title'
    }
})
// <demo title="my title" />
```

### 监听事件

子组件触发自定义事件，父组件监听对应事件

```vue
<demo @down="console.log('父组件监听到down事件')"/>
```

```vue
<button @click="$emit('down')">Click</button> <!-- 子组件点击触发  -->
```

用于`<script setup>`中

```js
const event = defineEmits(['down']);
const fun = () => {
    event('down');
}
```

### 插槽

```vue
<demo>
    <h2>Fly</h2>
</demo>
```

```vue
...
<slot>Default</slot>
...
```

### 动态组件

```vue
<!-- currentTab 改变时组件也改变 -->
<component :is="tabs[currentTab]"></component>
```

## 深入组件

全局注册的组件在生产打包的时候**无法被 tree-shaking 优化掉**。

在组件中**只写key没有value**（**仅写上 prop 但不传值**）会被隐式的转化为true

props遵循单向数据流，父组件向子组件传递数据时，子组件不能直接修改父组件的数据，如果你在子组件中去更改一个 prop，Vue 会在控制台上向你抛出警告：

如果父组件传入一个复合类型的 prop ，比如对象或者数组，那么子组件就可以修改并且不会触发警告，这是因为 JavaScript 的对象和数组是按引用传递，**对 Vue 来说，阻止这种更改需要付出的代价异常昂贵**，这种更改的主要缺陷是它允许了子组件以某种不明显的方式影响父组件的状态，可能会使数据流在将来变得更难以理解。

**最佳实践是子组件抛出一个事件，父组件监听这个事件并在回调中修改数据。**

**$emit** 校验：

```vue
<script setup>
const emit = defineEmits({
  // 校验 submit 事件
  submit: ({ email, password }) => {
    if (email && password) {
      return true
    } else {
      console.warn('Invalid submit event payload!')
      return false
    }
  }
})

function submitForm(email, password) {
  emit('submit', { email, password })
}
</script>
```

**为组件的 emits 标注类型**（**校验**）https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-emits


### 组件 v-model

```js
const model = defineModel()
// <Child v-model="countModel" />
```

`defineModel`的主要应用场景是**开发自定义表单控件或需要双向数据绑定的组件**，功能上和原生的`input`、`select`等表单元素类似。

`defineModel()` 返回的值是一个 ref，它可以像其他 ref 一样被访问以及修改，不过它能起到在**父组件和当前组件中变量之间的双向绑定**的作用：

```vue
<script setup>
const model = defineModel()
</script>

<template>
  <input v-model="model" />
</template>
<!-- <child v-model='count'/> -->
```

**底层机制**：

组件 `v-model` 本质上是 **`defineProps` 和 `defineEmits` 的语法糖**

```vue
<!-- Child.vue -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

```vue
<!-- Parent.vue -->
<Child
  :modelValue="foo"
  @update:modelValue="$event => (foo = $event)"
/>
```

还可以通过给 `defineModel` 传递选项，来声明底层 prop 的选项：

```js
const model = defineModel({ required: true	 })
const model = defineModel({ default: 0 })
```

**参数**：

```vue
<MyComponent v-model:title="bookTitle" />
```

将字符串作为第一个参数传递给 `defineModel()` 来支持相应的参数，额外的 prop 选项，应该在 model 名称之后传递，同样可以使用 defineModel 原理 的方式的写出。

```js
const title = defineModel('title',{ required: true })
```

有了参数对应，就可以有多个`v-model`绑定。

除了内除的修饰符，还可以在自定义组件的`v-model`中自定义修饰符。

在子组件中通过解构`defineModel`的返回值得到使用时的修饰符

```js
const [model, modifiers] = defineModel()
```

可以给 `defineModel()` 传入 `get` 和 `set` 这两个选项，这两个选项在从模型引用中读取或设置值时会接收到当前的值

```vue
<script setup>
const [model, modifiers] = defineModel({
  set(value) {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  },
    get(val){
        ...
		return val
    }
})
</script>

<template>
  <input type="text" v-model="model" />
</template>
```

上述的例子还能实现多`v-model`，`defineModel`的第一个参数是名称，第二个是处理选项

```js
const [model, modifiers] = defineModel('...',{...})
```

prop的安全的默认值创建方式：`default: () => ({ name: 'default' })`

关于为什么默认值要使用**工厂函数**：

如果是一个**原始类型**可以直接写，但是如果是引用类型（对象，数组），需要用**工厂函数返回对象**，才能确保每个实例都会创建新对象，否则所有组件实例共享同一个对象引用。

默认值的工厂函数机制是为了保证**数据实例的独立性**，防止某些操作意外修改数据后影响了所有组件引用的数据（数据污染）。