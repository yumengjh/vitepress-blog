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

### 透传 Attributes

**Attributes 继承**是指在组件系统中，当父组件将属性（attributes）传递给子组件时，如果子组件没有显式地声明或处理这些属性，那么这些属性就会被“**继承**”到**子组件的根元素上**。

如果一个子组件的根元素已经有了 `class` 或 `style` attribute，它会和从父组件上继承的值合并。

```vue
<!-- <MyButton> 的模板 -->
<button>Click Me</button>
```

```vue
<MyButton class="large" />
```

最终渲染：

```vue
<button class="large">Click Me</button>
```

同样的规则也适用于 `v-on` 事件监听器。

如果一个组件在根组件上渲染另一个组件，那么它接收的 Attributes 会直接继续传给**嵌套组件**（组件内的组件）

**注意**：透传 Attributes 不会包含声明过的 props 或是针对 `emits` 声明事件的 `v-on` 侦听函数，换句话说，声明过的 props 和侦听函数被 `<MyButton>`“**消费**”了。

如果你**不想要**一个组件自动地继承 attribute，你可以在组件选项中设置 `inheritAttrs: false`，透传进来的 attribute 可以在模板的表达式中直接用 `$attrs` 访问到，除了被"**消费**"了的 attribute

```vue
<script setup>
defineOptions({
  inheritAttrs: false
})
// ...setup 逻辑
</script>
```

更改透传属性的位置：

```vue
<div class="btn-wrapper">
  <button class="btn" v-bind="$attrs">Click Me</button>
</div>
```

::: tip 补充

无参数的 `v-bind` 会将一个对象的所有属性都作为 attribute 应用到目标元素上。

:::

**如果一个组件是多根节点，那么自动  attribute 透传行为是没有的**，如果 `$attrs` 没有被显式绑定，将会抛出一个运行时警告。

如果需要在JavaScript中访问透传 attribute ，需要先从`vue`中引入`useAttrs `API。

```vue
<script setup>
import { useAttrs } from 'vue'
const attrs = useAttrs()
</script>
```

### Slots

当一个组件同时接收默认插槽和具名插槽时，所有位于**顶级**的非 `<template>` 节点都被隐式地视为默认插槽的内容。

**条件插槽**：

```vue
<div v-if="$slots.header" class="card-header">
    <slot name="header" />
</div>
```

**动态插槽名**：

```vue
<template v-slot:[dynamicSlotName]></template>
```

**作用域插槽**：

子组件将数据交给父组件，父组件进行结构设计后再传入子组件，也就是父组件在使用插槽的时候同时拥有当前组件数据和子组件数据

方法是像对组件传递 props 那样，向一个插槽的出口上传递 attributes：

```vue
<!-- <MyComponent> 的模板 -->
<div>
  <slot :text="greetingMessage" :count="1"></slot>
</div>
```

通过子组件标签上的 `v-slot` 指令，直接接收到了一个插槽 props 对象：

```vue
<MyComponent v-slot="slotProps">
    {{ slotProps.text }} {{ slotProps.count }}
</MyComponent>
```

**具名作用域插槽**：

```vue
<MyComponent>
    <template #header="headerProps">
{{ headerProps }}
    </template>

    <template #default="defaultProps">
{{ defaultProps }}
    </template>

    <template #footer="footerProps">
{{ footerProps }}
    </template>
</MyComponent>
```

向具名插槽中传入 props：

```vue
<slot name="header" message="hello"></slot>
```

**注意**：插槽上的 `name` 是一个 Vue 特别保留的 attribute，不会作为 props 传递给插槽。

### 依赖注入

**依赖注入**：：一个父组件向下“**分发**”数据，它的所有后代（无论隔几代）都可以“**接收**”这些数据。

一个父组件相对于其所有的后代组件，会作为**依赖提供者**。任何后代的组件树，无论层级有多深，都可以**注入**由父组件提供给整条链路的依赖。

要为组件后代提供数据，需要使用到 [`provide()`](https://cn.vuejs.org/api/composition-api-dependency-injection.html#provide) 函数：

```vue
<script setup>
import { provide } from 'vue'

provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
</script>
```

`provide()` 函数接收两个参数。第一个参数被称为**注入名**，可以是一个字符串或是一个 `Symbol`。后代组件会用注入名来查找期望注入的值。一个组件可以多次调用 `provide()`，使用不同的注入名，注入不同的依赖值。

第二个参数是提供的值，值可以是任意类型，包括响应式的状态，比如一个 ref：

```js
import { ref, provide } from 'vue'

const count = ref(0)
provide('key', count)
```

**提供的响应式状态使后代组件可以由此和提供者建立响应式的联系**。

**应用层 Provide**：除了在一个组件中提供依赖，我们还可以在整个应用层面提供依赖：

```js
import { createApp } from 'vue'

const app = createApp({})

app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
```

在应用级别提供的数据在该应用内的所有组件中都可以注入。

要注入上层组件提供的数据，需使用 [`inject()`](https://cn.vuejs.org/api/composition-api-dependency-injection.html#inject) 函数：

```vue
<script setup>
import { inject } from 'vue'

const message = inject('message')
</script>
```

如果有多个父组件提供了**相同键的数据**，注入将解析为组件链上**最近的父组件**所注入的值。

如果注入名在祖先链上没有组件提供，可以声明一个默认值，否则会抛出一个运行时警告。

```js
// 如果没有祖先组件提供 "message"
// `value` 会是 "默认值"
const value = inject('message', '默认值')
```

在一些场景中，默认值可能需要通过调用一个函数或初始化一个类来取得。为了避免在用不到默认值的情况下进行不必要的计算或产生副作用，我们可以使用工厂函数来创建默认值。第三个参数表示默认值应该被当作一个工厂函数。

```js
const value = inject('key', () => new ExpensiveClass(), true)
```

当向后代提供数据时，**建议尽可能将任何对响应式数据的变更都保持在供给方组件中**，即传入数据的同时也传入改变数据的方法。

**使用 Symbol 作注入名**：在大型应用中会有很多的依赖提供者，建议最好使用 Symbol 来作为注入名以避免潜在的冲突。

推荐在一个单独的文件中导出这些注入名 Symbol：

```js
// keys.js
export const myInjectionKey = Symbol()
```

```js
// 在供给方组件中
import { provide } from 'vue'
import { myInjectionKey } from './keys.js'

provide(myInjectionKey, { 
  /* 要提供的数据 */
})``
```

```js
// 注入方组件
import { inject } from 'vue'
import { myInjectionKey } from './keys.js'

const injected = inject(myInjectionKey)
```

### 异步组件

在大型项目中，**为提高性能和优化加载速度**，可以将应用拆分为更小的模块，并按需从服务器加载所需组件。Vue 提供了 `defineAsyncComponent` 方法，以实现组件的异步加载功能。。

并且在类似Vite这样的打包工具中，异步组件会被自动拆分成独立的代码块。

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...从服务器获取组件
    resolve(/* 获取到的组件 */)
  })
})
// ... 像使用其他一般组件一样使用 `AsyncComp`
```

`defineAsyncComponent` 方法接收一个返回 Promise 的加载函数，而ESM 模块的 `import()` 函数正好符合这个要求：

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
)
```

`AsyncComp` 是一个被包装过的组件，Vue 会在需要时自动加载它，它会将接收到的 props 和 插槽传递给内部的组件，所以可以使用异步组件去无替换原始组件，并且实现了懒加载。

- [加载配置](https://cn.vuejs.org/guide/components/async.html#loading-and-error-states)
- [加载时机](https://cn.vuejs.org/guide/components/async.html#lazy-hydration)

