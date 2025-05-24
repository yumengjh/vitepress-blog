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

它的作用是为 Promise 实例添加状态改变时的回调函数，`then` 方法的第一个参数是 `resolved` 状态的回调函数，第二个参数是 `rejected` 状态的回调函数，它们都是可选的。		

`then` 方法返回的是一个新的 `Promise` 实例（注意，不是原来那个 `Promise` 实例）。因此可以采用链式写法，即 `then` 方法后面再调用另一个 `then` 方法。

```js {1,3}
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // ...
});
```

上面的代码使用`then`方法，依次指定了两个回调函数。**第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数。**

采用链式的`then`，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个`Promise`对象（即有异步操作），这时后一个回调函数，就会等待该`Promise`对象的状态发生变化，才会被调用。

```js
getJSON("/post/1.json").then(
  post => getJSON(post.commentURL)
).then(
  comments => console.log("resolved: ", comments),
  err => console.log("rejected: ", err)
);
```

上面代码中，第一个`then`方法指定的回调函数，返回的是另一个`Promise`对象。这时，第二个`then`方法指定的回调函数，就会等待这个新的`Promise`对象状态发生变化。如果变为`resolved`，就调用第一个回调函数，如果状态变为`rejected`，就调用第二个回调函数。

**绕点**：

then() 本身就返回一个 Promise: 这是 Promise 链式调用的关键。 无论你在 then() 中做什么，then() 方法都会返回一个新的 Promise。

**then()** **的返回的 Promise 的值，取决于** **then()** **中的** **return** **语句:**

- **如果 then() 中 return 一个值 (非 Promise)，** 那么 then() 返回的 Promise 会变为 fulfilled 状态，并且这个值会成为下一个 then() 的输入。
- **如果 then() 中 return 一个 Promise，** 那么 then() 返回的 Promise 会“等待” 这个被 return 的 Promise 变为 fulfilled 或 rejected 状态。 最终，then() 返回的 Promise 的状态和值，与被 return 的 Promise 的状态和值保持一致。

### catch()

`Promise.prototype.catch()`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。

Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个`catch`语句捕获。

```js
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个Promise产生的错误
});
```

上面代码中，一共有三个 Promise 对象：一个由`getJSON()`产生，两个由`then()`产生。它们之中任何一个抛出的错误，都会被最后一个`catch()`捕获。

一般来说，不要在`then()`方法里面定义 Reject 状态的回调函数（即`then`的第二个参数），总是使用`catch`方法。

```js
// bad
promise
  .then(function(data) {
    // success
  }, function(err) {
    // error
  });

// good
promise
  .then(function(data) { //cb
    // success
  })
  .catch(function(err) {
    // error
  });
```

上面代码中，第二种写法要好于第一种写法，理由是第二种写法可以捕获前面`then`方法执行中的错误，也更接近同步的写法（`try/catch`）。因此，建议总是使用`catch()`方法，而不使用`then()`方法的第二个参数。

### finally()

`finally()`方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。

### all()

`Promise.all()`方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.all([p1, p2, p3]);
```

上面代码中，`Promise.all()`方法接受一个数组作为参数，`p1`、`p2`、`p3`都是 Promise 实例，如果不是，就会先调用`Promise.resolve`方法，将参数转为 Promise 实例，再进一步处理。另外，`Promise.all()`方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是 Promise 实例。

`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。

（1）只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。

（2）只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。

```js
// 生成一个Promise对象的数组
const promises = [2, 3, 5, 7, 11, 13].map(function (id) {
  return getJSON('/post/' + id + ".json");
});

Promise.all(promises).then(function (posts) {
  // ...
}).catch(function(reason){
  // ...
});
```

### race()

`Promise.race()`方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要`p1`、`p2`、`p3`之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给`p`的回调函数。

### allSettled()

有时候，我们希望等到一组异步操作都结束了，不管每一个操作是成功还是失败，再进行下一步操作。但是，现有的 Promise 方法很难实现这个要求。

`Promise.all()`方法只适合所有异步操作都成功的情况，如果有一个操作失败，就无法满足要求。

`Promise.allSettled()`方法，用来确定一组异步操作是否都结束了（不管成功或失败）。

`Promise.allSettled()`方法接受一个数组作为参数，数组的每个成员都是一个 Promise 对象，并返回一个新的 Promise 对象。只有等到参数数组的所有 Promise 对象都发生状态变更（不管是`fulfilled`还是`rejected`），返回的 Promise 对象才会发生状态变更。

该方法返回的新的 Promise 实例，一旦发生状态变更，状态总是`fulfilled`，不会变成`rejected`。状态变成`fulfilled`后，它的回调函数会接收到一个数组作为参数，该数组的每个成员对应前面数组的每个 Promise 对象。

```js
const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(function (results) {
  console.log(results);
});
// [
//    { status: 'fulfilled', value: 42 },
//    { status: 'rejected', reason: -1 }
// ]
```

### any()

该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例返回。

只要参数实例有一个变成`fulfilled`状态，包装实例就会变成`fulfilled`状态；如果所有参数实例都变成`rejected`状态，包装实例就会变成`rejected`状态。

`Promise.any()`跟`Promise.race()`方法很像，只有一点不同，就是`Promise.any()`不会因为某个 Promise 变成`rejected`状态而结束，必须等到所有参数 Promise 变成`rejected`状态才会结束。

### resolve()

有时需要将现有对象转为 Promise 对象，`Promise.resolve()`方法就起到这个作用。

`Promise.resolve()`等价于下面的写法。

```js
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```

`Promise.resolve()`方法的参数分成四种情况。

**（1）参数是一个 Promise 实例**

如果参数是 Promise 实例，那么`Promise.resolve`将不做任何修改、原封不动地返回这个实例。

**（2）参数是一个`thenable`对象**

`thenable`对象指的是具有`then`方法的对象，比如下面这个对象。

```js
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};
```

`Promise.resolve()`方法会将这个对象转为 Promise 对象，然后就立即执行`thenable`对象的`then()`方法。

```js
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};

let p1 = Promise.resolve(thenable);
p1.then(function (value) {
  console.log(value);  // 42
});
```

上面代码中，`thenable`对象的`then()`方法执行后，对象`p1`的状态就变为`resolved`，从而立即执行最后那个`then()`方法指定的回调函数，输出42。

**（3）参数不是具有`then()`方法的对象，或根本就不是对象**

如果参数是一个原始值，或者是一个不具有`then()`方法的对象，则`Promise.resolve()`方法返回一个新的 Promise 对象，状态为`resolved`。

```js
const p = Promise.resolve('Hello');

p.then(function (s) {
  console.log(s)
});
// Hello
```

上面代码生成一个新的 Promise 对象的实例`p`。由于字符串`Hello`不属于异步操作（判断方法是字符串对象不具有 then 方法），返回 Promise 实例的状态从一生成就是`resolved`，所以回调函数会立即执行。`Promise.resolve()`方法的参数，会同时传给回调函数。

**（4）不带有任何参数**

`Promise.resolve()`方法允许调用时不带参数，直接返回一个`resolved`状态的 Promise 对象。

**需要注意的是，立即`resolve()`的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时。**

```js
setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('two');
});

console.log('one');

// one
// two
// three
```

上面代码中，`setTimeout(fn, 0)`在下一轮“事件循环”开始时执行，`Promise.resolve()`在本轮“事件循环”结束时执行，`console.log('one')`则是立即执行，因此最先输出。

### reject()

`Promise.reject(reason)`方法也会返回一个新的 Promise 实例，该实例的状态为`rejected`。

`Promise.reject()`方法的参数，会原封不动地作为`reject`的理由，变成后续方法的参数。