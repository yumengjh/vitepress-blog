---
title: 异步遍历器
date: 2025-06-02
category: Note
tags: 
    - JavaScript
description: 异步遍历器是 JavaScript 中用于处理异步数据流的强大工具。它允许我们以同步的方式遍历异步数据源，简化了异步编程的复杂性。
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

# Async-Iterator 

## 同步遍历器

Iterator 接口是一种数据遍历的协议，只要调用遍历器对象的`next`方法，就会得到一个对象，表示当前遍历指针所在的那个位置的信息。`next`**方法返回的对象的结构是**`{value, done}`，其中`value`表示当前的数据的值，`done`是一个布尔值，表示遍历是否结束。

```js
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return { value: index++, done: false };
    }
  };
}

const it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...

```

变量`it`是一个遍历器（iterator）。每次调用`it.next()`方法，就返回一个对象，表示当前遍历位置的信息。

这里隐含着一个规定，`it.next()`方法必须是同步的，只要调用就必须立刻返回值。也就是说，一旦执行`it.next()`方法，就必须同步地得到`value`和`done`这两个属性。

如果遍历指针正好指向同步操作，当然没有问题，但对于异步操作，就不太合适了。

```js
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          resolve({ value: index++, done: false });
        }, 1000);
      });
    }
  };
}
```

上面代码中，`next()`方法返回的是一个 Promise 对象，这样就不行，**不符合 Iterator 协议**，只要代码里面包含异步操作都不行。也就是说，**Iterator 协议里面`next()`方法只能包含同步操作。**

目前的解决方法是，将异步操作包装成 Thunk 函数或者 Promise 对象，即`next()`方法返回值的`value`属性是一个 Thunk 函数或者 Promise 对象，等待以后返回真正的值，而`done`属性则还是同步产生的。

```javascript
function idMaker() {
  let index = 0;

  return {
    next: function() {
      return {
        value: new Promise(resolve => setTimeout(() => resolve(index++), 1000)),
        done: false
      };
    }
  };
}

const it = idMaker();

it.next().value.then(o => console.log(o)) // 0
it.next().value.then(o => console.log(o)) // 1
it.next().value.then(o => console.log(o)) // 2
// ...
```

上面代码中，`value`属性的返回值是一个 Promise 对象，用来放置异步操作。

ES2018 引入了“异步遍历器”（Async Iterator），为异步操作提供原生的遍历器接口，即`value`和`done`这两个属性都是异步产生。

## 异步遍历的接口

异步遍历器的最大的语法特点，就是调用遍历器的`next`方法，返回的是一个 Promise 对象。

因此，可以使用`then`方法指定，这个 Promise 对象的状态变为`resolve`以后的回调函数。回调函数的参数，则是一个具有`value`和`done`两个属性的对象，这个跟同步遍历器是一样的。

一个对象的同步遍历器的接口，部署在`Symbol.iterator`属性上面。同样地，对象的异步遍历器接口，部署在`Symbol.asyncIterator`属性上面。不管是什么样的对象，只要它的`Symbol.asyncIterator`属性有值，就表示应该对它进行异步遍历。

```javascript
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();

asyncIterator
.next()
.then(iterResult1 => {
  console.log(iterResult1); // { value: 'a', done: false }
  return asyncIterator.next();
})
.then(iterResult2 => {
  console.log(iterResult2); // { value: 'b', done: false }
  return asyncIterator.next();
})
.then(iterResult3 => {
  console.log(iterResult3); // { value: undefined, done: true }
});
```

上面代码中，异步遍历器其实返回了两次值。第一次调用的时候，返回一个 Promise 对象；等到 Promise 对象`resolve`了，再返回一个表示当前数据成员信息的对象。这就是说，异步遍历器与同步遍历器最终行为是一致的，只是会先返回 Promise 对象，作为中介。

由于异步遍历器的`next`方法，返回的是一个 Promise 对象。因此，可以把它放在`await`命令后面。

```javascript
async function f() {
  const asyncIterable = createAsyncIterable(['a', 'b']);
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  console.log(await asyncIterator.next());
  // { value: 'a', done: false }
  console.log(await asyncIterator.next());
  // { value: 'b', done: false }
  console.log(await asyncIterator.next());
  // { value: undefined, done: true }
}
```

上面代码中，`next`方法用`await`处理以后，就不必使用`then`方法了。整个流程已经很接近同步处理了。

注意，异步遍历器的`next`方法是可以**连续调用**的，不必等到上一步产生的 Promise 对象`resolve`以后再调用。这种情况下，`next`方法会累积起来，自动按照每一步的顺序运行下去。下面是一个例子，把所有的`next`方法放在`Promise.all`方法里面。

```js
const asyncIterable = createAsyncIterable(['a', 'b']);
const asyncIterator = asyncIterable[Symbol.asyncIterator]();
const [{value: v1}, {value: v2}] = await Promise.all([
  asyncIterator.next(), asyncIterator.next()
]);

console.log(v1, v2); // a b
```

## for await...of

`for...of`循环用于遍历同步的 Iterator 接口。新引入的`for await...of`循环，则是用于遍历异步的 Iterator 接口。

```javascript
async function f() {
  for await (const x of createAsyncIterable(['a', 'b'])) {
    console.log(x);
  }
}
// a
// b
```

上面代码中，`createAsyncIterable()`返回一个**拥有异步遍历器接口的对象**，`for...of`循环自动调用这个对象的异步遍历器的`next`方法，会得到一个 Promise 对象。`await`用来处理这个 Promise 对象，一旦`resolve`，就把得到的值（`x`）传入`for...of`的循环体。

`for await...of`循环的一个用途，是部署了 asyncIterable 操作的异步接口，可以直接放入这个循环。

```javascript
let body = '';

async function f() {
  for await(const data of req) body += data;
  const parsed = JSON.parse(body);
  console.log('got', parsed);
}
```

如果`next`方法返回的 Promise 对象被`reject`，`for await...of`就会报错，要用`try...catch`捕捉。

## 异步 Generator 函数

就像 Generator 函数返回一个同步遍历器对象一样，异步 Generator 函数的作用，是返回一个异步遍历器对象。

在语法上，异步 Generator 函数就是`async`函数与 Generator 函数的结合。

```javascript
async function* gen() {
  yield 'hello';
}
const genObj = gen();
genObj.next().then(x => console.log(x));
// { value: 'hello', done: false }
```

上面代码中，`gen`是一个异步 Generator 函数，执行后返回一个异步 Iterator 对象。对该对象调用`next`方法，返回一个 Promise 对象。

异步遍历器的设计目的之一，**就是 Generator 函数处理同步操作和异步操作时，能够使用同一套接口。**

```javascript
// 同步 Generator 函数
function* map(iterable, func) {
  const iter = iterable[Symbol.iterator]();
  while (true) {
    const {value, done} = iter.next();
    if (done) break;
    yield func(value);
  }
}

// 异步 Generator 函数
async function* map(iterable, func) {
  const iter = iterable[Symbol.asyncIterator]();
  while (true) {
    const {value, done} = await iter.next();
    if (done) break;
    yield func(value);
  }
}
```

上面代码中，`map`是一个 Generator 函数，第一个参数是可遍历对象`iterable`，第二个参数是一个回调函数`func`。`map`的作用是将`iterable`每一步返回的值，使用`func`进行处理。上面有两个版本的`map`，前一个处理同步遍历器，后一个处理异步遍历器，可以看到两个版本的写法基本上是一致的。

## yield* 语句

`yield*`语句也可以跟一个异步遍历器。

```js
async function* gen1() {
  yield 'a';
  yield 'b';
  return 2;
}

async function* gen2() {
  // result 最终会等于 2
  const result = yield* gen1();
}
```

上面代码中，`gen2`函数里面的`result`变量，最后的值是`2`。

与同步 Generator 函数一样，`for await...of`循环会展开`yield*`。

```js
(async function () {
  for await (const x of gen2()) {
    console.log(x);
  }
})();
// a
// b
```
