---
title: JS中Promise的一些使用，包括状态传递，链式调用等
date: 2025-05-22
category: Note
tags: 
    - JavaScript
description: 主要记录Promise的一些使用，包括状态传递，链式调用等
---

# Promise

## 状态传递

`resolve` 函数的参数除了正常的值以外，还可能是另一个 Promise 实例

```js
const p1 = new Promise(function (resolve, reject) {
  // ...
});

const p2 = new Promise(function (resolve, reject) {
  // ...
  resolve(p1);
})
```

上面代码中，`p1` 和 `p2` 都是 Promise 的实例，但是 `p2` 的 `resolve` 方法将 `p1` 作为参数，**即一个异步操作的结果是返回另一个异步操作。**

注意，这时 `p1` 的状态就会传递给 `p2`，也就是说，`p1` 的状态决定了 `p2` 的状态。

如果 `p1` 的状态是 `pending`，那么 `p2` 的回调函数就会等待 `p1` 的状态改变；如果 `p1` 的状态已经是 `resolved` 或者 `rejected`，那么 `p2` 的回调函数将会立刻执行。

```js
const p1 = new Promise(function (resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
})

p2
  .then(result => console.log(result))
  .catch(error => console.log(error))
// Error: fail
```

上面的代码，`p1` 和 `p2` 同时开始执行（并发），1 秒后 `p2` 执行 `resolve`，再过 2 秒，`p1` 的 `reject` 执行

`resolve` 方法返回的是 `p1`。由于 `p2` 返回的是另一个 Promise，**导致 `p2` 自己的状态无效了，由 `p1` 的状态决定 `p2` 的状态。**

所以，后面的 `then` 语句都变成针对后者（`p1`），只会执行 `catch` 捕获错误。

**注意**，调用 `resolve` 或 `reject` 并不会终结 Promise 的参数函数的执行，也就是，在 `resolve` 或 `reject` 后的代码还会继续执行。

```js
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});
// 2
// 1
```

上面代码中，调用 `resolve(1)` 以后，后面的 `console.log(2)` 还是会执行，并且会首先打印出来。**这是因为立即 resolved 的 Promise 是在本轮事件循环的末尾执行**，总是晚于本轮循环的同步任务。

一般来说，调用 `resolve` 或 `reject` 以后，Promise 的使命就完成了，后继操作应该放到 `then` 方法里面，而不应该直接写在 `resolve` 或 `reject` 的后面。所以，最好在它们前面加上 `return` 语句，这样就不会有意外。

## 实例方法

### then()