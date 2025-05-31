---
title: JavaScript中的Class，作为对象的模板，只是一个语法糖，ES5 都可以做到
date: 2025-05-31
category: Note
tags: 
    - Javascript
description: 介绍了 JavaScript 中的 Class 语法，说明其本质上是对象的模板，是对原有基于原型的继承方式的语法糖，ES5 也可以实现类似功能。
cbf: false
---

# Class

## 概述

在没有`class`类之前，生成实例对象的方式是通过构造函数来实现的。

```javascript   
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function () {
  return '(' + this.x + ', ' + this.y + ')';
};

var p = new Point(1, 2);

p.toString(); // "(1, 2)"
```
在上面的代码中，`Point`函数是一个构造函数，用于创建一个新的点对象。通过`new`关键字调用它时，会创建一个新的对象，并将其`__proto__`指向`Point.prototype`，从而可以访问到`toString`方法。

> [!tip] 补充
> 实例对象有 `__proto__`，构造函数有 `prototype`，`__proto__` 指向构造函数的 `prototype`，所以实例才能继承原型上的方法，因为当你在实例上调用方法时，JavaScript 会先查找实例对象本身是否有该方法，如果没有，就会查找其 `__proto__`，即构造函数的 `prototype` 上是否有该方法。

在ES6中引入了`class`语法，使得创建类和继承变得更加直观和易于理解。`class`实际上是对原有基于原型的继承方式的语法糖。

上面的代码可以用`class`语法重写如下：

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}

const p = new Point(1, 2);

p.toString(); // "(1, 2)"
```

上面代码中，`constructor`方法是类的构造函数，`this`指向实例对象用于初始化实例对象的属性。`toString`方法是类的实例方法，可以直接在实例上调用。

构造函数的`prototype`属性在类中继续存在，因为事实上，类的所有方法都是定义在`prototype`上的。

```javascript
class Point {
  constructor() {
    // ...
  }

  toString() {
    // ...
  }

  toValue() {
    // ...
  }
}

// 等同于

Point.prototype = {
  constructor() {},
  toString() {},
  toValue() {},
};
```

因此，在类的实例上面调用方法，其实就是调用原型上的方法。

```javascript
class B {}
const b = new B();

b.constructor === B.prototype.constructor // true
```
由于类的方法都定义在`prototype`上，所以类的方法可以直接在`prototype`上添加，Object.assign()方法可以很方便地一次向类添加多个方法。

```javascript
class Point {
  constructor(){
    // ...
  }
}

Object.assign(Point.prototype, {
  toString(){},
  toValue(){}
});
```

`prototype`对象的`constructor`属性，直接指向**类**的本身。

```javascript
Point.prototype.constructor === Point // true
```

类的内部所有定义的方法，都是不可枚举的，这意味着它们不会出现在`for...in`循环中，也不会被`Object.keys()`。
 
## constructor()