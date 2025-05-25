---
title: JavaScript的一些零碎的知识，构造函数，原型对象，深拷贝，this，Promise
date: 2025-01-01
category: Note
tags:
    - JavaScript
description: Promise，作用域，箭头函数，构造函数，深浅拷贝，异常处理，this，防抖节流
outline: [2,4]
---

# JavaScript

```javascript
let num = prompt("请输入"); // 以弹框的形式提升用户输入
```

### 断点调试

**作用**：帮助理解代码，工作时更快找到BUG

浏览器打开调试界面，开发者工具，点到源代码一栏(sources)，选择代码文件

**断点**：在某句代码上加的标记就叫断点，当程序执行到这句有标记的代码时会暂停下来

### 作用域

#### 函数作用域

1. 在函数内部申明的变量只能在函数内部被访问，外部无法直接访问
2. 函数的参数也是函数内部的局部变量

#### 块级作用域

使用`{}`包裹的代码被称为代码块，代码块内部申明的变量外部将【有可能】无法被访问

#### 全局作用域

1. 全局作用域中声明的变量，任何其它作用域都可以被访问
2. 尽可能少的声明全局变量，防止全局变量被污染

#### 作用域链

函数内部创建的新函数，会产生新的函数作用域，由此可知作用域产生了嵌套的关系。

父子关系的作用域关联在一起形成了链状的结构

作用域链本质上是底层的变量查找机制，在函数被执行时，会优先查找当前函数作用域中查找变量，如果当前作用域查找不到则会依次逐级查找父级作用域直到全局作用域

### 闭包

使用闭包能够访问函数作用域中的变量。从代码形式上看闭包是一个做为返回值的函数

```javascript
function outer() {
      let count = 1
      function fn() {
        count++
        console.log(`函数被调用${count}次`)
      }
      return fn
    }
    const re = outer()
```

总结：

闭包 = 内层函数 + 外层函数的变量

作用：

- 封闭数据，实现数据私有，外部也可以访问函数内部的变量
- 闭包很有用，因为它允许将函数与其所操作的某些数据（环境）关联起来


- 可能会造成内存泄漏

### 函数

动态参数

`arguments` 是函数内部内置的伪数组变量，它包含了调用函数时传入的所有实参

```javascript
// 求生函数，计算所有参数的和
  function sum() {
    // console.log(arguments)
    let s = 0
    for(let i = 0; i < arguments.length; i++) {
      s += arguments[i]
    }
    console.log(s)
  }
  // 调用求和函数
  sum(5, 10)// 两个参数
  sum(1, 2, 4) // 两个参数
```

总结：

1. `arguments` 是一个伪数组
2. `arguments` 的作用是动态获取函数的实参

#### 剩余参数

```javascript
 function config(baseURL, ...other) {
    console.log(baseURL) // 得到 'http://baidu.com'
    console.log(other)  // other  得到 ['get', 'json']
  }
  // 调用函数
  config('http://baidu.com', 'get', 'json');
```

总结：

1. `...` 是语法符号，置于最末函数形参之前，用于获取多余的实参
2. 借助 `...` 获取的剩余实参，是个真数组

### 箭头函数

总结：

1. 箭头函数属于表达式函数，因此**不存在函数提升**
2. 箭头函数只有一个参数时可以省略圆括号 `()`
3. 箭头函数函数体只有一行代码时可以**省略**花括号 `{}`，并自动做为返回值被返回

#### 箭头函数参数箭头函数 this

箭头函数中没有 `arguments`，只能使用 `...` 动态获取实参

```javascript
 // 1. 利用箭头函数来求和
    const getSum = (...arr) => {
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i]
      }
      return sum
    }
    const result = getSum(2, 3, 4)
    console.log(result) // 9
```

#### 箭头函数 this

箭头函数不会创建自己的this,它只会从自己的作用域链的上一层沿用this。

```javascript
 const fn = () => {
       console.log(this)  // window
     }
     fn()
 const obj = {
       uname: 'pink老师',
       sayHi: () => {
        console.log(this)  // window
       }
     }
     obj.sayHi()
```

## 构造函数

构造函数是专门用于创建对象的函数，如果一个函数使用`new`关键字调用，那么这个函数就是构造函数

总结：

1. 使用 `new` 关键字调用函数的行为被称为实例化
2. 实例化构造函数时没有参数时可以省略 `()`
3. 构造函数的返回值即为新创建的对象
4. 构造函数内部的 `return` 返回的值无效！

注：实践中为了从视觉上区分构造函数和普通函数，习惯将构造函数的首字母大写。

### 实例成员

通过构造函数创建的对象称为实例对象，实例对象中的属性和方法称为实例成员。

总结：

1. 构造函数内部 `this` 实际上就是实例对象，为其动态添加的属性和方法即为实例成员
2. 为构造函数传入参数，动态创建结构相同但值不同的对象

注：构造函数创建的实例对象彼此独立互不影响。

### 静态成员

在JavaScript中低层函数本质也是对象类型，因此允许直接为函数动态添加属性或者方法，构造函数的属性和方法被称为静态成员。

```javascript
  // 构造函数
  function Person(name, age) {
    // 省略实例成员
  }
  // 静态属性
  Person.eyes = 2
  Person.arms = 2
  // 静态方法
  Person.walk = function () {
    console.log('^_^人都会走路...')
    // this 指向 Person
    console.log(this.eyes)
  }
```

总结：

1. 静态成员指的是添加到构造函数本身的属性和方法
2. 一般**公共特征**的属性或方法静态成员设置为静态成员
3. 静态成员方法中的 `this` 指向构造函数本身



## 内置构造函数

在 JavaScript 中**最主要**的数据类型有 6 种，分别是字符串、数值、布尔、undefined、null 和 对象，常见的对象类型数据包括数组和普通对象。其中字符串、数值、布尔、undefined、null 也被称为简单类型或基础类型，**对象也被称为引用类型**。

在 JavaScript 内置了一些构造函数，绝大部的**数据处理**都是基于这些构造函数实现的，JavaScript 基础阶段学习的 `Date` 就是内置的构造函数。

```javascript
// 实例化
  let date = new Date();
  
  // date 即为实例对象
  console.log(date);
```



## 面向过程

![](https://raw.githubusercontent.com/fish81/typora-uploads-images/main/image/1744109337_0.png)

面向过程就是分析出解决问题所需要的步骤，然后用函数将这些步骤一一实现，使用的时候在一个一个的一次调用即可。

## 面向对象

![](https://raw.githubusercontent.com/fish81/typora-uploads-images/main/image/1744109339_0.png)

在面向对象程序开发思想中，每一个对象都是功能中心，具有明确分工。

面向对象编程具有灵活，代码可以重复使用，容易维护和开发的优点，更适合多人合作的大型软件项目

特性：

- 封装性

- 继承性

- 多态性

  封装是面向对象思想中比较重要的一部分，JavaScript面向对象可以通过构造函数实现的封装

  同样的将变量和函数组合到了一起并且能通过this实现数据共享，所不同的是借助构造函数创建出来的实例对象之间是彼此不影响的

  > 总结：
  > 构造函数体现了面向对象的封装特性
  >
  > 构造函数实例创建的对象彼此独立，互不影响
  >
  > 

面向对象和面向过程两个开发思想的区别：

- 面向对象：分工明确，合作完成
- 面向过程：步骤明确，步步完成



## 原型对象

构造函数通过原型分配的函数是所有对象所共享的(理解：所有实例化对象都可以调用其构造函数中的方法或者属性)

JavaScript规定，每一个构造函数都有一个**prototype属性**，指向另一个对象，所以我们也称为**原型对象**

这个对象可以挂载函数，对象实例化不会多次创建原型上函数，节约内存

我们可以把那些不变的方法，直接定义在prototype对象上，这样所有对象的实例就可以共享这些方法

构造函数和原型对象的this都指向实例化对象

> #### 构造函数与原型对象的关系: (?)
>
> - **构造函数**用于创建对象实例，并初始化对象的属性。
> - **原型对象**用于存储对象实例共享的属性和方法，并通过原型链实现继承。
> - 构造函数和原型对象共同作用，构成了 JavaScript 的面向对象编程基础。
>
> 理解构造函数与原型对象的关系对于掌握 JavaScript 的面向对象编程至关重要。

#### 原型对象具体作用:

```javascript
  function Person() {
    // 此处未定义任何方法
  }

  // 为构造函数的原型对象添加方法
  Person.prototype.sayHi = function () {
    console.log('Hi~');
  }
  
  // 实例化
  let p1 = new Person();
  p1.sayHi(); // 输出结果为 Hi~
// 构造函数 Person 中未定义任何方法，这时实例对象调用了原型对象中的方法 sayHi
 function Person() {
    // 此处定义同名方法 sayHi
    this.sayHi = function () {
      console.log('嗨!');
    }
  }

  // 为构造函数的原型对象添加方法
  Person.prototype.sayHi = function () {
    console.log('Hi~');
  }

  let p1 = new Person();
  p1.sayHi(); // 输出结果为 嗨!
// 构造函数 Person 中定义与原型对象中相同名称的方法，这时实例对象调用则是构造函中的方法 sayHi。
```

总结：

- 通过上述例子发现JavaScript对象的工作机制是：当访问对象的属性或者方法时，先在当前实例对象上查找，然后再去原型对象查找，并且**原型对象所有实例共享**
- 结合构造函数原型的特征，实际开发重往往会将封装的功能函数添加到原型对象中。

## constructor 属性

每个原型对象都有个constructor属性（construction构造函数）

作用：该属性指向该原型对象的构造函数，简单理解就是指向我的爸爸，我是我爸爸的孩子

**使用场景：**

如果有多个对象的方法，我们可以给原型对象采取对象形式赋值.

但是这样就会覆盖构造函数原型对象原来的内容，这样修改后的原型对象 constructor 就不再指向当前构造函数了

此时，我们可以在修改后的原型对象中，添加一个 constructor 指向原来的构造函数。

### 对象原型

对象都会有一个属性 __proto__ 指向构造函数的 prototype 原型对象，之所以我们对象可以使用构造函数 prototype 

原型对象的属性和方法，就是因为对象有 __proto__ 原型的存在。

注意：

- __proto__ 是JS非标准属性
- [[prototype]]和__proto__意义相同
- 用来表明当前实例对象指向哪个原型对象prototype
- __proto__对象原型里面也有一个 constructor属性，指向创建该实例对象的构造函数

### 原型继承

继承是面向对象编程的另一个特征，通过继承进一步提升代码封装的程度，JavaScript 中大多是借助原型对象实现继承

的特性。

龙生龙、凤生凤、老鼠的儿子会打洞描述的正是继承的含义。

```javascript
// 继续抽取   公共的部分放到原型上
    // const Person1 = {
    //   eyes: 2,
    //   head: 1
    // }
    // const Person2 = {
    //   eyes: 2,
    //   head: 1
    // }
    // 构造函数  new 出来的对象 结构一样，但是对象不一样
    function Person() {
      this.eyes = 2
      this.head = 1
    }
    // console.log(new Person)
    // 女人  构造函数   继承  想要 继承 Person
    function Woman() {

    }
    // Woman 通过原型来继承 Person
    // 父构造函数（父类）   子构造函数（子类）
    // 子类的原型 =  new 父类  
    Woman.prototype = new Person()   // {eyes: 2, head: 1} 
    // 指回原来的构造函数
    Woman.prototype.constructor = Woman

    // 给女人添加一个方法  生孩子
    Woman.prototype.baby = function () {
      console.log('宝贝')
    }
    const red = new Woman()
    console.log(red)
    // console.log(Woman.prototype)
    // 男人 构造函数  继承  想要 继承 Person
    function Man() {

    }
    // 通过 原型继承 Person
    Man.prototype = new Person()
    Man.prototype.constructor = Man
    const pink = new Man()
    console.log(pink)
```

### 原型链

基于原型对象的继承使得不同构造函数的原型对象关联在一起，并且这种关联的关系是一种链状的结构，我们将原型对象的链状结构关系称为原型链

![原型链](https://image.yumeng.icu/2025-05-25%2F212644.png){width="70%"}

![](https://raw.githubusercontent.com/fish81/typora-uploads-images/main/image/1744109347_0.png)

```javascript
 // function Objetc() {}
    console.log(Object.prototype)
    console.log(Object.prototype.__proto__)

    function Person() {

    }
    const ldh = new Person()
    // console.log(ldh.__proto__ === Person.prototype)
    // console.log(Person.prototype.__proto__ === Object.prototype)
    console.log(ldh instanceof Person)
    console.log(ldh instanceof Object)
    console.log(ldh instanceof Array)
    console.log([1, 2, 3] instanceof Array)
    console.log(Array instanceof Object)
```

① 当访问一个对象的属性（包括方法）时，首先查找这个对象自身有没有该属性。

② 如果没有就查找它的原型（也就是 __proto__指向的 prototype 原型对象）

③ 如果还没有就查找原型对象的原型（Object的原型对象）

④ 依此类推一直找到 Object 为止（null）

⑤ __proto__对象原型的意义就在于为对象成员查找机制提供一个方向，或者说一条路线

⑥ 可以使用 instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上

## 深浅拷贝

首先浅拷贝和深拷贝只针对引用类型

### 浅拷贝

浅拷贝：拷贝的是地址

常见方法：

- 拷贝对象：Object.assgin()  /  展开运算符 {...obj} 拷贝对象
- 拷贝数组：Array.prototype.cancat() 或者 [...arr]

> 如果是简单数据类型拷贝值，引用数据类型拷贝的是地址（简单理解：如果是单层对象，没问题，但是有多层就有问题）

### 深拷贝

深拷贝：拷贝的是对象，不是地址

常见方法：

- 通过递归实现深拷贝
- lodash/cloneDeep
- 通过JSON.stringify()实现

#### 递归实现深拷贝

函数递归：

定义：如果一个函数在内部可以调用其本身，那么这个函数就是**递归函数**

- 简单理解：函数内部自己调用自己，这个函数就是递归函数

- 递归函数的作用和循环类似

- 由于递归很容易发生“栈溢出”错误(stack overflow) ,所以必须加退出条件return 

  

```javascript
const obj = {
      uname: 'pink',
      age: 18,
      hobby: ['乒乓球', '足球'],
      family: {
        baby: '小pink'
      }
    }
    const o = {}
    // 拷贝函数
    function deepCopy(newObj, oldObj) {
      debugger
      for (let k in oldObj) {
        // 处理数组的问题  一定先写数组 在写 对象 不能颠倒
        if (oldObj[k] instanceof Array) {
          newObj[k] = []
          //  newObj[k] 接收 []  hobby
          //  oldObj[k]   ['乒乓球', '足球']
          deepCopy(newObj[k], oldObj[k])
        } else if (oldObj[k] instanceof Object) {
          newObj[k] = {}
          deepCopy(newObj[k], oldObj[k])
        }
        else {
          //  k  属性名 uname age    oldObj[k]  属性值  18
          // newObj[k]  === o.uname  给新对象添加属性
          newObj[k] = oldObj[k]
        }
      }
    }
    deepCopy(o, obj) // 函数调用  两个参数 o 新对象  obj 旧对象
    console.log(o)
    o.age = 20
    o.hobby[0] = '篮球'
    o.family.baby = '老pink'
    console.log(obj)
    console.log([1, 23] instanceof Object)
    // 复习
    // const obj = {
    //   uname: 'pink',
    //   age: 18,
    //   hobby: ['乒乓球', '足球']
    // }
    // function deepCopy({ }, oldObj) {
    //   // k 属性名  oldObj[k] 属性值
    //   for (let k in oldObj) {
    //     // 处理数组的问题   k 变量
    //     newObj[k] = oldObj[k]
    //     // o.uname = 'pink'
    //     // newObj.k  = 'pink'
    //   }
    // }
```

#### JavaScript库 lodsh里面 cloneDeep内部实现了深拷贝

> `lodash` 是一个流行的 JavaScript 工具库，提供了许多实用的函数，其中 `_.cloneDeep` 方法用于实现对象的深拷贝。

```javascript
<script src="./lodash.min.js"></script>
  <script>
    const obj = {
      uname: 'pink',
      age: 18,
      hobby: ['乒乓球', '足球'],
      family: {
        baby: '小pink'
      }
    }
    const o = _.cloneDeep(obj)
    console.log(o)
    o.family.baby = '老pink'
    console.log(obj)
```

#### JSON序列化

```javascript
 const obj = {
      uname: 'pink',
      age: 18,
      hobby: ['乒乓球', '足球'],
      family: {
        baby: '小pink'
      }
    }
    // 把对象转换为 JSON 字符串
    // console.log(JSON.stringify(obj))
    const o = JSON.parse(JSON.stringify(obj))
    console.log(o)
    o.family.baby = '123'
    console.log(obj)
```

## 异常处理

> 防止程序异常时而导致程序直接停止，提前布置异常处理方法

#### throw

异常处理是指预估代码执行过程中可能出现的错误，然后最大程度的避免错误的发生导致整个程度无法继续运行

总结：

- throw 抛出异常信息。程序也会终止运行
- throw后面跟的是错误提示信息
- Error对象配合throw 使用，能够设置更详细的错误信息

```javascript
 function counter(x, y) {

    if(!x || !y) {
      // throw '参数不能为空!';
      throw new Error('参数不能为空!')
    }

    return x + y
  }

  counter()
```

#### try ... catch

```JavaScript
function foo() {
      try {
        // 查找 DOM 节点
        const p = document.querySelector('.p')
        p.style.color = 'red'
      } catch (error) {
        // try 代码段中执行有错误时，会执行 catch 代码段
        // 查看错误信息
        console.log(error.message)
        // 终止代码继续执行
        return

      }
      finally {
          alert('执行')
      }
      console.log('如果出现错误，我的语句不会执行')
    }
    foo()
```

总结：

- `try .. catch`用于捕获错误信息
- 将预估可能发生的错误的代码写在`try`代码段中


- 如果 `try` 代码段中出现错误后，会执行 `catch` 代码段，并截获到错误信息

#### debugger

相当于断点调试

## 处理this

> 函数中this在不同场景下的默认值，动态指定函数的this值

`this` 是 JavaScript 最具“魅惑”的知识点，不同的应用场合 `this` 的取值可能会有意想不到的结果，在此我们对以往学习过的关于【 `this` 默认的取值】情况进行归纳和总结。

### 普通函数

**普通函数**的调用方式决定了 `this` 的值，即【谁调用 `this` 的值指向谁】

```JavaScript
// 普通函数
  function sayHi() {
    console.log(this)  
  }
  // 函数表达式
  const sayHello = function () {
    console.log(this)
  }
  // 函数的调用方式决定了 this 的值
  sayHi() // window
  window.sayHi()
  

// 普通对象
  const user = {
    name: '小明',
    walk: function () {
      console.log(this)
    }
  }
  // 动态为 user 添加方法
  user.sayHi = sayHi
  uesr.sayHello = sayHello
  // 函数调用方式，决定了 this 的值
  user.sayHi()
  user.sayHello()
```

注： 普通函数没有明确调用者时 `this` 值为 `window`，**严格模式**下没有调用者时 `this` 的值为 `undefined`。

### 箭头函数

**箭头函数**中的 `this` 与普通函数完全不同，也不受调用方式的影响，事实上箭头函数中并不存在 `this` ！箭头函数中访问的 `this` 不过是箭头函数所在作用域的 `this` 变量。

```JavaScript
  console.log(this) // 此处为 window
  // 箭头函数
  const sayHi = function() {
    console.log(this) // 该箭头函数中的 this 为函数声明环境中 this 一致
  }
  
```

在开发中【使用箭头函数前需要考虑函数中 `this` 的值】，**事件回调函数**使用箭头函数时，`this` 为全局的 `window`，因此DOM事件回调函数不推荐使用箭头函数，如下代码所示：

```javascript
// DOM 节点
  const btn = document.querySelector('.btn')
  // 箭头函数 此时 this 指向了 window
  btn.addEventListener('click', () => {
    console.log(this)
  })
  // 普通函数 此时 this 指向了 DOM 对象
  btn.addEventListener('click', function () {
    console.log(this)
  })
```

同样由于箭头函数 `this` 的原因，**基于原型的面向对象也不推荐采用箭头函数**，如下代码所示：

```javascript
function Person() {
  }
  // 原型对像上添加了箭头函数
  Person.prototype.walk = () => {
    console.log('人都要走路...')
    console.log(this); // window
  }
  const p1 = new Person()
  p1.walk()
```

### 改变this指向

以上归纳了普通函数和箭头函数中关于 `this` 默认值的情形，不仅如此 JavaScript 中还允许指定函数中 `this` 的指向，有 3 个方法可以动态指定普通函数中 `this` 的指向：

#### call

使用 `call` 方法调用函数，同时指定函数中 `this` 的值，使用方法如下代码所示：

```javascript
// 普通函数
  function sayHi() {
    console.log(this);
  }

  let user = {
    name: '小明',
    age: 18
  }

  let student = {
    name: '小红',
    age: 16
  }

  // 调用函数并指定 this 的值
  sayHi.call(user); // this 值为 user
  sayHi.call(student); // this 值为 student

  // 求和函数
  function counter(x, y) {
    return x + y;
  }

  // 调用 counter 函数，并传入参数
  let result = counter.call(null, 5, 10);
  console.log(result);
```

总结：

1. `call` 方法能够在调用函数的同时指定 `this` 的值
2. 使用 `call` 方法调用函数时，第1个参数为 `this` 指定的值
3. `call` 方法的其余参数会依次自动传入函数做为**函数的参数

#### apply



```javascript
 // 普通函数
  function sayHi() {
    console.log(this)
  }

  let user = {
    name: '小明',
    age: 18
  }

  let student = {
    name: '小红',
    age: 16
  }

  // 调用函数并指定 this 的值
  sayHi.apply(user) // this 值为 user
  sayHi.apply(student) // this 值为 student

  // 求和函数
  function counter(x, y) {
    return x + y
  }
  // 调用 counter 函数，并传入参数
  let result = counter.apply(null, [5, 10])
  console.log(result)
```

总结：

1. `apply` 方法能够在调用函数的同时指定 `this` 的值
2. 使用 `apply` 方法调用函数时，第1个参数为 `this` 指定的值
3. `apply` 方法第2个参数为数组，数组的单元值依次自动传入函数做为函数的参数

#### bind

`bind` 方法并**不会调用函数**，而是创建一个指定了 `this` 值的新函数，使用方法如下代码所示：

```javascript
 // 普通函数
  function sayHi() {
    console.log(this)
  }
  let user = {
    name: '小明',
    age: 18
  }
  // 调用 bind 指定 this 的值
  let sayHello = sayHi.bind(user);
  // 调用使用 bind 创建的新函数
  sayHello()
```

注：`bind` 方法创建新的函数，与原函数的**唯一的变化**是改变了 `this` 的值。

## 防抖节流

- 防抖（debounce），就是指触发事件后在n秒内函数只能执行一次，如果在n秒内又触发了事件，则会重新计算函数执行时间
- 节流（throttle），就是指连续触发事件但是在n秒内只执行一次函数

## Promise入门

Promise是ES6规范中的一门新技术，它是一个构造函数，用来封装一个异步操作并且可以获取其成功/失败的结果值

### 创建Promise实例对象

```js
const p=new Promise((resolve,reject)=>{
     resolve("Success"); // 异步操作成功时调用
     reject("Error"); // 失败时调用
})
```



- Pending未决定的
- Resolved / Fullfiled 成功
- Rejected 失败

Resolve调用后可以将promise对象的状态设置为成功
Reject 调用后可以将promise对象的状态设置为失败

- Pending=>resolved/ fullfiled
- Pending=>rejected

只有这两种情况，且一个promise对象只能改变一次
Resolve和reject函数可以传参数，之后在then的两个回调函数里面可以接收到

### 指定回调函数

调用then方法
then有两个参数并且都是函数，第一个是promise对象成功的回调，第二个是失败回调

```js
p.then((value)=>{
        console.log(value)
},(reason)=>{
        console.log(reason)
})
```



### API

**Promise(excutor){}**
Excutor函数:执行器(resolve,reject)=>{}
resolve函数：内部定义成功时就调用 value=>{}
reject函数：内部定义失败时就调用 reason=>{}
说明：excutor会在Promise内部立即同步调用，异步操作会在执行器中执行

**Promise.prototype.then**
实例对象.then(成功回调，失败回调)
说明：返回一个新的promise对象
返回的promisei结果由then()指定的回调函数执行的结果决定

**Promise.prototype.catch**
失败回调函数
p.catch(reason=>{...})

**promise.resolve**

```js
let p1=promise.resolve(233)
Let p2=promise.resolve(new Promise((Resolve,Reject)=>{
Resolve(‘OK’)
}))
//如果传入的参数为非promise类型对象，则返回的结果为成功promise对象
//如果传入的参数为promise对象，则参数的结果决定了resolve的结果
```



**promise.reject**

```js
let p1=promise.reject(233);
//返回的结果永远是失败的，即使参数是一个promise实例对象并且成功
```



**promise.all**
参数是包括了n个promise的数组
说明：返回一个新的promise，只有数组中所有的promise都成功才成功，只要有一个失败就直接失败

```js
let p1=new promise((resolve,reject)=>{resolve(“OK”)})
let p2=promise.resolve(“Success”)
let p3=promise=resolve(“yes”)
const result=promise.all([p1,p2,p3])
```



**promise.race**
参数是包括了n个promise的数组
说明：返回一个新的promise，第一个完成的promise的结果就是最终的结果状态

```js
const result=promise.race([p1,p2,p3])
//由p1决定结果
```



**promise状态**
除了resolve和reject可以修改promise状态
还可以用throw（抛出）

```js
throw 'error';
```



**多个回调函数**
一个promise指定多个失败/成功回调，当promise改为对应状态时都会调用

**执行顺序**
正常情况是先指定回调再改变状态，但也可以先改变状态再指定回调
先改变状态再指定回调：

- 在执行中直接调用resolve或者reject
- 延迟更长时间才调用then

先指定回调再改变状态：

- 当实例对象中是一个异步任务的时候

**串联多个任务**
链式调用：
then返回一个新的promise，可以开成then的链式调用
通过then的链式调用串联多个同步/异步任务

```js
 let p =new Promise((resolve,reject)=>{
        setTimeout(()=>{  
            resolve("OKK")
        },1000)
       })
p.then(value=>{
    return new Promise((resolve,reject)=>{
        resolve("success")
    })
}).then(value=>{
    console.log(value) // success
}).then(value=>{
    console.log(value) // undefined
})
```



**异常穿透**
当使用promise的then链式调用时候，可以在最后指定失败的回调
前面任何操作出了异常，都会传到最后失败的回调中处理

```js
 let p =new Promise((resolve,reject)=>{
        setTimeout(()=>{  
            resolve("OKK")
        },1000)
       })
p.then(value=>{
    return new Promise((resolve,reject)=>{
        resolve("success")
    })
}).then(value=>{
    console.log(value) // success
}).then(value=>{
    console.log(value) // undefined
}).catch((reason)=>{ 
console.log(reason);
})
```



在最后加.catch(reason=>{...})，使用then也行

**中断promise链**
当使用promise链式调用时，在中间中断，不在调用后面的回调函数
方法：在回调函数中返回一个pendding状态的promise

```js
return new promise(()=>{})
```



**Async**
函数的返回值为promise对象
Promise对象的结果由async函数执行的返回值决定

- 如果返回值是一个非promise类型的数据，结果就是成功的
- 如果返回值是一个promise对象，resolve就成功，reject就失败
- 如果是抛出异常(throw)，结果是一个失败的promise对象

```js
async function main(){
     return new Promise((resolve,reject)=>{
          resolve()
})
}
Let result =main()
//它和then方法返回规则是一样的
```



**await**
await右侧的表达式一般为promise对象，但也可以是其他值

- 如果表达式是promise对象，await返回的是promise成功的值
- 如果表达式是其他的值，直接将此值作为await的返回值
  注意：
  await必须写在async函数中，但async函数中可以没有await
  如果await的promise失败了，就会抛出异常，需要同过try...catch捕获处理

```js
 try {
            let result = await new Promise((resolve,reject)=>{
                reject()
             })              
} catch (error) {
       reject(error)
}
```



**async和await结合实践**

```js
try{
     let data1=await _promise对象_
     let data2=await _promise对象_
     let data3=await _promise对象_
}catch(error){
     console.log(error)
}
```



**事件循环机制**
async函数在抛出返回值时，会根据返回值类型开启不同数目的微任务

- return结果值：非thenable、非promise（不等待）
- return结果值：thenable（等待 1个then的时间）
- return结果值：promise（等待 2个then的时间）

await右值类型区别

- 接非 thenable 类型，会立即向微任务队列添加一个微任务then，但不需等待
- 
- 接 thenable 类型，需要等待一个 then 的时间之后执行
- 
- 接Promise类型(有确定的返回值)，会立即向微任务队列添加一个微任务then，但不需等待
- 
- TC 39 对await 后面是 promise 的情况如何处理进行了一次修改，移除了额外的两个微任务，在早期版本，依然会等待两个 then 的时间