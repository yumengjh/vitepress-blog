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

![](https://cn.vuejs.org/assets/directive.DtZKvoAo.png){no-zoom}
