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

`constructor()`方法是类的默认方法，通过`new`关键字调用类时，默认会调用这个方法来创建实例对象。

一个类必须有一个`constructor()`方法，如果没有显式定义，JavaScript会自动创建一个空的`constructor()`方法。

`constructor()`方法默认返回`this`，即实例对象。如果需要返回其他对象，可以在`constructor()`方法中显式地返回该对象。

```javascript
class Foo {
  constructor() {
    return Object.create(null);
  }
}

new Foo() instanceof Foo
// false
```

## 类的实例

类的属性和方法除非显示的定义在`this`对象上，否则都是定义在原型对象上，即定义在`prototype`上。

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

var point = new Point(2, 3);

point.toString() // (2, 3)

point.hasOwnProperty('x') // true
point.hasOwnProperty('y') // true
point.hasOwnProperty('toString') // false
point.__proto__.hasOwnProperty('toString') // true
```

可以开出，上面的`x`和`y`都是实例对象`point`自身的属性，因为定义在`this`对象上，所以`point.hasOwnProperty('x')`和`point.hasOwnProperty('y')`都返回`true`。

而`toString`方法定义在原型对象上，所以`point.hasOwnProperty('toString')`返回`false`，但是可以通过`point.__proto__.hasOwnProperty('toString')`访问到。

类的所有实例都共享同一个原型对象。

```javascript
let p1 = new Point(1,2);
let p2 = new PPoint(3,4);
p1.__proto__ === p2.__proto__ // true
```

上面的代码中，`p1`和`p2`都是`Point`类的实例，它们的原型对象是同一个，即`Point.prototype`

这就意味着，可以通过实例的`__proto__`属性为类添加方法。

> [!tip] 补充
> `__proto__`并不是语言本身的属性，而是浏览器实现的一个属性，用于访问对象的原型。它是一个非标准的属性，虽然在大多数浏览器中都可以使用，但不建议在生产代码中使用。

在生成环境中，建议使用`Object.getPrototypeOf()`方法来获取对象的原型，然后再为原型添加方法或属性。

```javascript
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__.printName = function () { return 'Oops' };

p1.printName() // "Oops"
p2.printName() // "Oops"

var p3 = new Point(4,2);
p3.printName() // "Oops"
```

使用`__proto__`属性改写原型，必须注意，这样做会影响所有实例对象，因为它们共享同一个原型对象。


## 实例属性的新写法

ES2022为类的实例属性提供了一种新的写法，实例对象现在除了可以定义在`constructor()`方法中的`this`对象上，还可以定义在类内部的最顶层。

**原来的写法**

```javascript 
// 原来的写法
class IncreasingCounter {
  constructor() {
    this._count = 0;
  }
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
```

**新的写法**

```javascript
class IncreasingCounter {
  _count = 0;
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
```

上面代码中，实例属性`_count`与取值函数`value`和方法`increment`处于同一层级。这时候，就不需要在实例属性前面加上`this`了。

**注意**：新写法定义的属性是实例对象自身的属性，而不是定义在实例对象的原型（`__proto__`）上面的。

```javascript
class IncreasingCounter {
  _count = 0;
  get value() {
    console.log('Getting the current value!');
    return this._count;
  }
  increment() {
    this._count++;
  }
}
const counter = new IncreasingCounter();

IncreasingCounter.prototype.hasOwnProperty('_count') // false
console.log(counter.hasOwnProperty('_count')) // true
```
这种写法的好处是，所有的实例对象自身的属性都可以在类的最顶层定义，而不需要在`constructor()`方法中定义，这样可以使代码更加简洁和易读。

## Getters和Setters

在类的内部，可以使用`get`和`set`关键字定义访问器属性（Getters和Setters），对某个属性进行拦截。

```javascript
class MyClass {
  constructor() {
    // ...
  }
  get prop() {
    return 'getter';
  }
  set prop(value) {
    console.log('setter: '+value);
  }
}

let inst = new MyClass();

inst.prop = 123;
// setter: 123

inst.prop
// 'getter'
```

存值函数和取值函数实际上是设置在属性的Descriptor（属性描述对象）对象上的。

```javascript
class CustomHTMLElement {
  constructor(element) {
    this.element = element;
  }

  get html() {
    return this.element.innerHTML;
  }

  set html(value) {
    this.element.innerHTML = value;
  }
}

var descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype, "html"
);

"get" in descriptor  // true
"set" in descriptor  // true
```

上面的代码中，可以看出存值函数和取值函数是定义在html属性的描述对象上面。

## 属性表达式

类的属性名可以使用表达式来定义，这样可以动态地生成属性名。

```javascript

let mehodName = 'toString';
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  [mehodName]() {
    return '(' + this.x + ', ' + this.y + ')';
  }
}
const p = new Point(1, 2);
p.toString(); // "(1, 2)"
```
上面的代码中，`mehodName`变量的值是`toString`，所以类的实例方法名也是`toString`。

## Class 表达式

与函数一样，类也可以使用表达式的形式定义。

```javascript
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
};
```

这个类的名字是`Me`，但是`Me`只在类的内部可用，外部无法访问，类的外部应该使用`myClass`变量来访问这个类。

如果类的内部没用到的话，可以省略`Me`。

采用 Class 表达式，可以写出立即执行的 Class。

```javascript
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('张三');

person.sayName(); // "张三"
```

## 静态方法

类相当于实例的原型，所有在类中定义的方法，都会被实例继承。

如果在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod() // 'hello'

var foo = new Foo();
foo.classMethod()
// TypeError: foo.classMethod is not a function
```

**注意**，如果静态方法包含this关键字，这个this指的是类，而不是实例。

静态方法可以与非静态方法重名。

父类的静态方法，可以被子类继承。

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
}

Bar.classMethod() // 'hello'
```

静态方法也是可以从super对象上调用的。

```javascript
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
  static classMethod() {
    return super.classMethod() + ', too';
  }
}

Bar.classMethod() // "hello, too"
```

子类的静态方法中的`super`关键字指向父类，但是非静态方法中的`super`关键字指向父类的原型对象。

## 静态属性

静态属性指的是 Class 本身的属性，即Class.propName，而不是定义在实例对象（this）上的属性。

```javascript
class Foo {
}

Foo.prop = 1;
Foo.prop // 1
```

目前，只有这种写法可行，因为 ES6 明确规定，Class 内部只有静态方法，没有静态属性。现在有一个提案提供了类的静态属性，写法是在实例属性的前面，加上static关键字。

```javascript
// 老写法
class Foo {
  // ...
}
Foo.prop = 1;

// 新写法
class Foo {
  static prop = 1;
}
```
这种写法的好处是，可以在类的内部定义静态属性，而不需要在类的外部定义。
新写法是显式声明（declarative），而不是赋值处理，语义更好。

## 私有方法和私有属性

私有方法和私有属性，是只能在类的内部访问的方法和属性，外部不能访问。

早期没有私有方法和私有属性的概念，通常是通过在方法或属性名前加上下划线（_）来表示该方法或属性是私有的，但是这只是一种约定，并不能真正实现私有，因为在外部仍然可以访问。

ES2022引入了私有方法和私有属性的概念，使用`#`符号来定义。

```javascript
class IncreasingCounter {
  #count = 0;
  get value() {
    console.log('Getting the current value!');
    return this.#count;
  }
  increment() {
    this.#count++;
  }
}
```
上面的代码中，`#count`是一个私有属性，只有在类的内部可以访问，外部无法访问。

**注意：** 在Chrome开发者工具中，可以读取私有属性并且不会报错。

私有属性和私有方法前面，也可以加上static关键字，表示这是一个静态的私有属性或私有方法。


## 继承

Class 可以通过extends关键字实现继承，让子类继承父类的属性和方法。extends 的写法比 ES5 的原型链继承，要清晰和方便很多。

```javascript
class Point {
}

class ColorPoint extends Point {
}
```
上面的代码中，`ColorPoint`类继承了`Point`类的所有属性和方法。

super在普通方法中表示父类的构造函数，用来新建一个父类的实例对象。

ES6 规定，子类必须在constructor()方法中调用super()，否则就会报错。这是因为子类自己的this对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，添加子类自己的实例属性和方法。如果不调用super()方法，子类就得不到自己的this对象。

关于为什么子类必须调用super()，原因就在于 ES6 的继承机制，与 ES5 完全不同。ES5 的继承机制，是先创造一个独立的子类的实例对象，然后再将父类的方法添加到这个对象上面，即“实例在前，继承在后”。ES6 的继承机制，则是先将父类的属性和方法，加到一个空的对象上面，然后再将该对象作为子类的实例，即“继承在前，实例在后”。这就是为什么 ES6 的继承必须先调用super()方法，因为这一步会生成一个继承父类的this对象，没有这一步就无法继承父类。

**注意**，这意味着新建子类实例时，父类的构造函数必定会先运行一次。

在子类的构造函数中，只有调用super()之后，才可以使用this关键字，否则会报错。这是因为子类实例的构建，必须先完成父类的继承，只有super()方法才能让子类实例继承父类。

如果子类没有定义constructor()方法，这个方法会默认添加，并且里面会调用super()。也就是说，不管有没有显式定义，任何一个子类都有constructor()方法。

```javascript
class ColorPoint extends Point {
}

// 等同于
class ColorPoint extends Point {
  constructor(...args) {
    super(...args);
  }
}
```

## 私有属性和私有方法的继承

父类所有的属性和方法，都会被子类继承，除了私有的属性和方法。

子类无法继承父类的私有属性，或者说，私有属性只能在定义它的 class 里面使用。

```javascript
class Foo {
  #p = 1;
  #m() {
    console.log('hello');
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(this.#p); // 报错
    this.#m(); // 报错
  }
}
```

## 静态属性和静态方法的继承

父类的静态属性和静态方法，也会被子类继承。

注意，静态属性是通过浅拷贝实现继承的，浅拷贝只会拷贝对象的内存地址，所以如果父类的静态属性是一个对象，那么子类继承的静态属性和父类的静态属性指向同一个对象。

## Object.getPrototypeOf()

`Object.getPrototypeOf(obj)` 返回对象 `obj` 的 `[[Prototype]]`（也就是 `__proto__`）。

- 当 `obj` 是一个 **构造函数（子类）** 时，它返回其 **父类构造函数**；
- 当 `obj` 是一个 **实例对象** 时，它返回该实例的 **原型对象（即构造函数的 `.prototype`）**。

```javascript
class Point { /*...*/ }

class ColorPoint extends Point { /*...*/ }

Object.getPrototypeOf(ColorPoint) === Point
// true
```

## super 关键字

super这个关键字，既可以当作函数使用，也可以当作对象使用。在这两种情况下，它的用法完全不同。

第一种情况，super作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次super()函数。

调用super()的作用是形成子类的this对象，把父类的实例属性和方法放到这个this对象上面。子类在调用super()之前，是没有this对象的，任何对this的操作都要放在super()的后面。

注意，这里的super虽然代表了父类的构造函数，但是因为返回的是子类的this（即子类的实例对象），所以super内部的this代表子类的实例，而不是父类的实例，这里的super()相当于A.prototype.constructor.call(this)（在子类的this上运行父类的构造函数）。

```javascript
class A {
  constructor() {
    console.log(new.target.name);
  }
}
class B extends A {
  constructor() {
    super();
  }
}
new A() // A
new B() // B
```

上面示例中，new.target指向当前正在执行的函数。可以看到，在super()执行时（new B()），它指向的是子类B的构造函数，而不是父类A的构造函数。也就是说，super()内部的this指向的是B。

作为函数时，super()只能用在子类的构造函数之中，用在其他地方就会报错。

第二种情况，super作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。

```javascript
class A {
  p() {
    return 2;
  }
}

class B extends A {
  constructor() {
    super();
    console.log(super.p()); // 2
  }
}

let b = new B();
```
上面代码中，子类B当中的super.p()，就是将super当作一个对象使用。这时，super在普通方法之中，指向A.prototype，所以super.p()就相当于A.prototype.p()。

这里需要注意，由于super指向父类的原型对象，所以定义在父类实例上的方法或属性，是无法通过super调用的。

```javascript
class A {
  constructor() {
    this.p = 2;
  }
}

class B extends A {
  get m() {
    return super.p;
  }
}

let b = new B();
b.m // undefined
```
如果属性定义在父类的原型对象上，super就可以取到。

```javascript
class A {}
A.prototype.x = 2;

class B extends A {
  constructor() {
    super();
    console.log(super.x) // 2
  }
}

let b = new B();
b.x // 2
```

ES6 规定，在子类普通方法中通过super调用父类的方法时，方法内部的this指向当前的子类实例。

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  m() {
    super.print();
  }
}

let b = new B();
b.m() // 2
```

由于this指向子类实例，所以如果通过super对某个属性赋值，这时super就是this，赋值的属性会变成子类实例的属性。

```javascript
class A {
  constructor() {
    this.x = 1;
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
    super.x = 3;
    console.log(super.x); // undefined
    console.log(this.x); // 3
  }
}

let b = new B();
b.x // 3
```

上面代码中，super.x赋值为3，这时等同于对this.x赋值为3。而当读取super.x的时候，读的是A.prototype.x，所以返回undefined。

如果super作为对象，用在静态方法之中，这时super将指向父类，而不是父类的原型对象。

```javascript
class Parent {
  static myMethod(msg) {
    console.log('static', msg);
  }

  myMethod(msg) {
    console.log('instance', msg);
  }
}

class Child extends Parent {
  static myMethod(msg) {
    super.myMethod(msg);
  }

  myMethod(msg) {
    super.myMethod(msg);
  }
}

Child.myMethod(1); // static 1

var child = new Child();
child.myMethod(2); // instance 2
Parent.myMethod(3); // static 3
```

上面代码中，super在静态方法之中指向父类，在普通方法之中指向父类的原型对象。

另外，在子类的静态方法中通过super调用父类的方法时，方法内部的this指向当前的子类，而不是子类的实例。

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  static print() {
    console.log(this.x);
  }
}

class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  static m() {
    super.print();
  }
}

B.x = 3;
B.m() // 3
```

上面代码中，静态方法B.m里面，super.print指向父类的静态方法。这个方法里面的this指向的是B，而不是B的实例。

## 类的 prototype 属性和__proto__属性

每一个对象都有__proto__属性，指向对应的构造函数的prototype属性。Class 作为构造函数的语法糖，同时有prototype属性和__proto__属性，因此同时存在两条继承链。

（1）子类的__proto__属性，表示构造函数的继承，总是指向父类。

（2）子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性。

```javascript
class A {
}

class B extends A {
}

B.__proto__ === A // true
B.prototype.__proto__ === A.prototype // true
```
上面代码中，子类B的__proto__属性指向父类A，子类B的prototype属性的__proto__属性指向父类A的prototype属性。
子类B的prototype属性指向子类B的原型对象，它是指向一个由 JavaScript 自动创建的对象，这个对象的 __proto__ 指向 A.prototype，实现原型链继承。

这样的结果是因为，类的继承是按照下面的模式实现的。

```javascript
class A {
}

class B {
}

// B 的实例继承 A 的实例
Object.setPrototypeOf(B.prototype, A.prototype);

// B 继承 A 的静态属性
Object.setPrototypeOf(B, A);

const b = new B();
```

Object.setPrototypeOf方法的实现。

```javascript
Object.setPrototypeOf = function (obj, proto) {
  obj.__proto__ = proto;
  return obj;
}
```

因此，就得到了上面的结果。

```javascript
Object.setPrototypeOf(B.prototype, A.prototype);
// 等同于
B.prototype.__proto__ = A.prototype;

Object.setPrototypeOf(B, A);
// 等同于
B.__proto__ = A;
```

子类（B）的原型（__proto__属性）是父类（A）；作为一个构造函数，子类（B）的原型对象（prototype属性）是父类的原型对象（prototype属性）的实例。

extends关键字后面可以跟多种类型的值。

```javascript
class B extends A {
}
```

上面代码的A，只要是一个有prototype属性的函数，就能被B继承。由于函数都有prototype属性（除了Function.prototype函数），因此A可以是任意函数。

## 实例的 __proto__ 属性 

子类实例的`__proto__`属性的`__proto__`属性，指向父类实例的`__proto__`属性。也就是说，子类的原型的原型，是父类的原型。

```javascript
var p1 = new Point(2, 3);
var p2 = new ColorPoint(2, 3, 'red');

p2.__proto__ === p1.__proto__ // false
p2.__proto__.__proto__ === p1.__proto__ // true
```

上面代码中，`ColorPoint`继承了`Point`，导致前者原型的原型是后者的原型。

因此，通过子类实例的`__proto__.__proto__`属性，可以修改父类实例的行为。

```js
p2.__proto__.__proto__.printName = function () {
  console.log('Ha');
};

p1.printName() // "Ha"
```

上面代码在`ColorPoint`的实例`p2`上向`Point`类添加方法，结果影响到了`Point`的实例`p1`。

## Mixin 模式的实现

Mixin 指的是多个对象合成一个新的对象，新对象具有各个组成成员的接口。它的最简单实现如下。

```js
const a = {
  a: 'a'
};
const b = {
  b: 'b'
};
const c = {...a, ...b}; // {a: 'a', b: 'b'}
```

上面代码中，`c`对象是`a`对象和`b`对象的合成，具有两者的接口。

下面是一个更完备的实现，将多个类的接口“混入”（mixin）另一个类。

```js
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()); // 拷贝实例属性
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin); // 拷贝静态属性
    copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if ( key !== 'constructor'
      && key !== 'prototype'
      && key !== 'name'
    ) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}
```

上面代码的`mix`函数，可以将多个对象合成为一个类。使用的时候，只要继承这个类即可。

```js
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
```

