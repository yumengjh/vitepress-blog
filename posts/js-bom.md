---
title: JavaScript之BOM
date: 2025-05-16
category: Note
tags: 
    - JavaScript
description: BOM是浏览器对象模型，提供了与浏览器窗口交互的方法和属性。
---

# BOM

:::details 目录
[[toc]]
:::

## 代码嵌入

JavaScript 是浏览器的内置脚本语言。也就是说，浏览器内置了 JavaScript 引擎，并且提供各种接口，让 JavaScript 脚本可以控制浏览器的各种功能。

一旦网页内嵌了 JavaScript 脚本，浏览器加载网页，就会去执行脚本，从而达到操作浏览器的目的，实现网页的各种动态效果。

使用`<script>`标签嵌入Js代码的时候，有一个`type`属性，用来指定脚本类型。对 JavaScript 脚本来说，`type`属性可以设为两种值。但是嵌入JavaScript 脚本时，`type`属性可以省略。

- `text/javascript`：这是默认值，也是历史上一贯设定的值。如果你省略`type`属性，默认就是这个值。对于老式浏览器，设为这个值比较好。
- `application/javascript`：对于较新的浏览器，建议设为这个值。

**注意：**如果`type`属性的值，浏览器不认识，那么它不会执行其中的代码。

```html
<script id="mydata" type="x-custom-data">
  console.log('Hello World');
</script>
```

上面的代码，浏览器不会执行，也不会显示它的内容，因为不认识它的`type`属性。

但是，这个`<script>`节点依然存在于 DOM 之中，可以使用`<script>`节点的`text`属性读出它的内容。

```js
document.getElementById('mydata').text
//   console.log('Hello World');
```

当使用`<script>`标签加载外部脚本的时候，如果脚本文件使用了非英语字符，还应该注明字符的编码，在`<script>`标签中加入`charset="utf-8"`属性。

**防止攻击者篡改外部脚本**：

`script`标签允许设置一个`integrity`属性，写入该外部脚本的 Hash 签名，用来验证脚本的一致性。

`integrity`属性是子资源完整性(Subresource Integrity)规范的一部分，浏览器会计算加载脚本的哈希值，与integrity属性提供的哈希值比对，只有哈希值匹配时才会执行脚本，不匹配则拒绝执行

integrity值由两部分组成，格式为：`算法名-哈希值`，支持的算法包括：

- `sha256`
- `sha384`
- `sha512`

例如：`sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC`

`integrity`属性主要用于防止`CDN`劫持，确保从CDN加载的脚本未被篡改

**生成integrity值**：

可以使用openssl工具生成：

```bash
openssl dgst -sha384 -binary example.js | openssl base64 -A
```

**注意：** **必须与crossorigin="anonymous"一起使用**：因为integrity检查需要CORS支持，**不影响同源脚本**：同域脚本不需要此属性，**性能影响**：浏览器需要计算哈希值，会有微小性能开销

## script 元素

### 工作原理

浏览器加载 JavaScript 脚本，主要通过`<script>`元素完成。正常的网页加载流程是这样的。

1. 浏览器一边下载 HTML 网页，一边开始解析。也就是说，不等到下载完，就开始解析。
2. 解析过程中，浏览器发现`<script>`元素，就暂停解析，把网页渲染的控制权转交给 JavaScript 引擎。
3. 如果`<script>`元素引用了外部脚本，就下载该脚本再执行，否则就直接执行代码。
4. JavaScript 引擎执行完毕，控制权交还渲染引擎，恢复往下解析 HTML 网页。

**加载外部脚本时，浏览器会暂停页面渲染，等待脚本下载并执行完成后，再继续渲染。**

原因是 JavaScript 代码可以修改 DOM，所以必须把控制权让给它，否则会导致复杂的线程竞赛的问题。

如果外部脚本加载时间很长（一直无法完成下载），那么浏览器就会一直等待脚本下载完成，造成网页长时间失去响应，浏览器就会呈现“假死”状态，这被称为“**阻塞效应**”。

为了避免这种情况，较好的做法是将`<script>`标签都放在页面底部，而不是头部。

这样即使遇到脚本失去响应，网页主体的渲染也已经完成了，用户至少可以看到内容，而不是面对一张空白的页面。<u>如果某些脚本代码非常重要，一定要放在页面头部的话，最好直接将代码写入页面，而不是连接外部脚本文件，这样能缩短加载时间。</u>

脚本文件都放在网页尾部加载，还有一个好处。因为在 DOM 结构生成之前就调用 DOM 节点，JavaScript 会报错，如果脚本都在网页尾部加载，就不存在这个问题，因为这时 DOM 肯定已经生成了。

```html
<head>
  <script>
    console.log(document.body.innerHTML);	// Error
  </script>
</head>
<body>
    ...
</body>
```

上面代码执行时会报错，因为此时`document.body`元素还未生成。

一种解决方法是设定`DOMContentLoaded`事件的回调函数。

```js
<head>
  <script>
    document.addEventListener(
      'DOMContentLoaded',
      function (event) {
        console.log(document.body.innerHTML);
      }
    );
  </script>
</head>
```

上面代码中，指定`DOMContentLoaded`事件发生后，才开始执行相关代码。`DOMContentLoaded`事件只有在 DOM 结构生成之后才会触发。

当`<script>`标签指定的外部脚本文件下载和解析完成，会触发一个`load`事件，可以把所需执行的代码，放在这个事件的回调函数里面。

```js
<script src="jquery.min.js" onload="console.log(document.body.innerHTML)">
</script>
```

如果将脚本放在页面底部，就可以完全按照正常的方式写。

如果有多个`script`标签，比如下面这样。

```js
<script src="a.js"></script>
<script src="b.js"></script>
```

浏览器会同时并行下载`a.js`和`b.js`，但是，执行时会保证先执行`a.js`，然后再执行`b.js`，即使后者先下载完成，也是如此。

也就是说，脚本的执行顺序由它们在页面中的出现顺序决定，这是为了保证脚本之间的依赖关系不受到破坏。

当然，加载这两个脚本都会产生“**阻塞效应**”，必须等到它们都加载完成，浏览器才会继续页面渲染。

解析和执行 CSS，也会产生阻塞。Firefox 浏览器会等到脚本前面的所有样式表，都下载并解析完，再执行脚本；Webkit则是一旦发现脚本引用了样式，就会暂停执行脚本，等到样式表下载并解析完，再恢复执行。

此外，对于来自同一个域名的资源，比如脚本文件、样式表文件、图片文件等，浏览器一般有限制，同时最多下载6～20个资源，即最多同时打开的 TCP 连接有限制，这是为了防止对服务器造成太大压力。如果是来自不同域名的资源，就没有这个限制。所以，通常把静态文件放在不同的域名之下，以加快下载速度。

### defer 属性

为了解决脚本文件下载阻塞网页渲染的问题，一个方法是对`<script>`元素加入`defer`属性。它的作用是延迟脚本的执行，等到 DOM 加载生成后，再执行脚本。

`defer`属性的运行流程如下。

1. 浏览器开始解析 HTML 网页。
2. 解析过程中，发现带有`defer`属性的`<script>`元素。
3. 浏览器继续往下解析 HTML 网页，同时并行下载`<script>`元素加载的外部脚本。
4. 浏览器完成解析 HTML 网页，此时再回过头执行已经下载完成的脚本。

有了`defer`属性，浏览器下载脚本文件的时候，不会阻塞页面渲染。

对于内置而不是加载外部脚本的`script`标签，以及动态生成的`script`标签，`defer`属性不起作用。

### async 属性

`async`属性的作用是，使用另一个进程下载脚本，下载时不会阻塞渲染。

1. 浏览器开始解析 HTML 网页。
2. 解析过程中，发现带有`async`属性的`script`标签。
3. 浏览器继续往下解析 HTML 网页，同时并行下载`<script>`标签中的外部脚本。
4. 脚本下载完成，浏览器暂停解析 HTML 网页，开始执行下载的脚本。
5. 脚本执行完毕，浏览器恢复解析 HTML 网页。

`async`属性可以保证脚本下载的同时，浏览器继续渲染。需要注意的是，一旦采用这个属性，就无法保证脚本的执行顺序。哪个脚本先下载结束，就先执行那个脚本。

**总结**：

一般来说，如果脚本之间没有依赖关系，就使用`async`属性，如果脚本之间有依赖关系，就使用`defer`属性。

### 动态加载

```js
['a.js', 'b.js'].forEach(function(src) {
  var script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
});
```

动态生成的`script`标签不会阻塞页面渲染，也就不会造成浏览器假死。

但是这种方法无法保证脚本的执行顺序，哪个脚本文件先下载完成，就先执行哪个。

避免这个问题，可以设置async属性为`false`。

```js
script.async = false;
```

加入上面代码后，可以保证`b.js`在`a.js`后面执行。不过需要注意的是，在这段代码后面加载的脚本文件，会因此都等待`b.js`执行完成后再执行。

还可以为动态加载的脚本指定回调函数

```js
function loadScript(src, done) {
  var js = document.createElement('script');
  js.src = src;
  js.onload = function() {
    done();
  };
  js.onerror = function() {
    done(new Error('Failed to load script ' + src));
  };
  document.head.appendChild(js);
}
```

### 加载协议

如果不指定协议，浏览器默认采用 HTTP 协议下载。

```js
<script src="example.js"></script>
```

如果要采用 HTTPS 协议下载，必需写明。

但是有时我们会希望，根据页面本身的协议来决定加载协议，这时可以采用下面的写法。

```js
<script src="//example.js"></script>
```

## 浏览器的组成

浏览器的核心是两部分：**渲染引擎**和 **JavaScript 解释器**（又称 JavaScript 引擎）。

### 渲染引擎

渲染引擎的主要作用是，将网页代码渲染为用户视觉可以感知的平面文档。

渲染引擎处理网页，通常分成四个阶段。

1. 解析代码：HTML 代码解析为 DOM，CSS 代码解析为 CSSOM（CSS Object Model）。
2. 对象合成：将 DOM 和 CSSOM 合成一棵渲染树（render tree）。
3. 布局：计算出渲染树的布局（layout）。
4. 绘制：将渲染树绘制到屏幕。

以上四步并非严格按顺序执行，往往第一步还没完成，第二步和第三步就已经开始了。所以，会看到这种情况：网页的 HTML 代码还没下载完，但浏览器已经显示出内容了。

### 重流和重绘	

渲染树转换为网页布局，称为“布局流”（flow）。

布局显示到页面的这个过程，称为“绘制”（paint）。它们都具有阻塞效应，并且会耗费很多时间和计算资源。

页面生成以后，脚本操作和样式表操作，都会触发“重流”（reflow）和“重绘”（repaint）。

用户的互动也会触发重流和重绘，比如设置了鼠标悬停（`a:hover`）效果、页面滚动、在输入框中输入文本、改变窗口大小等等。

重流和重绘并不一定一起发生，重流必然导致重绘，重绘不一定需要重流。比如改变元素颜色，只会导致重绘，而不会导致重流；改变元素的布局，则会导致重绘和重流。

大多数情况下，浏览器会智能判断，将重流和重绘只限制到相关的子树上面，最小化所耗费的代价，而不会全局重新生成网页。

<u>作为开发者，应该尽量设法降低重绘的次数和成本。</u>

比如，尽量不要变动高层的 DOM 元素，而以底层 DOM 元素的变动代替；再比如，重绘`table`布局和`flex`布局，开销都会比较大。

```js
var foo = document.getElementById('foobar');

foo.style.color = 'blue';
foo.style.marginTop = '30px';
```

上面的代码只会导致一次重绘，因为浏览器会累积 DOM 变动，然后一次性执行。

下面是一些优化技巧。

- 读取 DOM 或者写入 DOM，尽量写在一起，不要混杂。不要读取一个 DOM 节点，然后立刻写入，接着再读取一个 DOM 节点。
- 缓存 DOM 信息。
- 不要一项一项地改变样式，而是使用 CSS class 一次性改变样式。
- 使用`documentFragment`操作 DOM
- 动画使用`absolute`定位或`fixed`定位，这样可以减少对其他元素的影响。
- 只在必要时才显示隐藏元素。
- 使用`window.requestAnimationFrame()`，因为它可以把代码推迟到下一次重绘之前执行，而不是立即要求页面重绘。
- 使用虚拟 DOM（virtual DOM）库。

### JavaScript 引擎

JavaScript 引擎的主要作用是，读取网页中的 JavaScript 代码，对其处理后运行。

JavaScript 是一种解释型语言，也就是说，它不需要编译，由解释器实时运行。

这样的好处是运行和修改都比较方便，刷新页面就可以重新解释；缺点是每次运行都要调用解释器，系统开销较大，运行速度慢于编译型语言。

为了提高运行速度，目前的浏览器都将 JavaScript 进行一定程度的编译，生成类似字节码（bytecode）的中间代码，以提高运行速度。

早期，浏览器内部对 JavaScript 的处理过程如下：

1. 读取代码，进行词法分析（Lexical analysis），将代码分解成词元（token）。
2. 对词元进行语法分析（parsing），将代码整理成“语法树”（syntax tree）。
3. 使用“翻译器”（translator），将代码转为字节码（bytecode）。
4. 使用“字节码解释器”（bytecode interpreter），将字节码转为机器码。

逐行解释将字节码转为机器码，是很低效的。为了提高运行速度，现代浏览器改为采用“即时编译”（Just In Time compiler，缩写 JIT），即字节码只在运行时编译，用到哪一行就编译哪一行，并且把编译结果缓存（inline cache）。通常，一个程序被经常用到的，只是其中一小部分代码，有了缓存的编译结果，整个程序的运行速度就会显著提升。

字节码不能直接运行，而是运行在一个虚拟机（Virtual Machine）之上，一般也把虚拟机称为 JavaScript 引擎。并非所有的 JavaScript 虚拟机运行时都有字节码，有的 JavaScript 虚拟机基于源码，即只要有可能，就通过 JIT（just in time）编译器直接把源码编译成机器码运行，省略字节码步骤。这一点与其他采用虚拟机（比如 Java）的语言不尽相同。这样做的目的，是为了尽可能地优化代码、提高性能。下面是目前最常见的一些 JavaScript 虚拟机：

## window 对象

### window.closed

这个属性一般用来检查，使用脚本打开的新窗口是否关闭。

```js
var popup = window.open();

if ((popup !== null) && !popup.closed) {
  // 窗口仍然打开着
}
```

### window.opener

`window.opener`属性表示打开当前窗口的父窗口。如果当前窗口没有父窗口（即直接在地址栏输入打开），则返回`null`。

```js
window.open().opener === window // true
```

```js
var newWin = window.open('example.html', 'newWindow', 'height=400,width=400');
newWin.opener = null;
```

上面代码中，子窗口的`opener`属性设为`null`，两个窗口之间就没办法再联系了。

通过`opener`属性，可以获得父窗口的全局属性和方法，但只限于两个窗口同源的情况，且其中一个窗口由另一个打开。`<a>`元素添加`rel="noopener"`属性，可以防止新打开的窗口获取父窗口，减轻被恶意网站修改父窗口 URL 的风险。

### 位置大小属性

#### **（1）window.screenX，window.screenY**

`window.screenX`和`window.screenY`属性，返回浏览器窗口左上角相对于当前屏幕左上角的水平距离和垂直距离（单位像素）。这两个属性只读。

#### **（2） window.innerHeight，window.innerWidth**

`window.innerHeight`和`window.innerWidth`属性，返回网页在当前窗口中可见部分的高度和宽度，即“视口”（viewport）的大小（单位像素）。这两个属性只读。

用户放大网页的时候（比如将网页从100%的大小放大为200%），这两个属性会变小。因为这时网页的像素大小不变（比如宽度还是960像素），只是每个像素占据的屏幕空间变大了，因此可见部分（视口）就变小了。

注意，这两个属性值包括滚动条的高度和宽度。

#### **（3）window.outerHeight，window.outerWidth**

`window.outerHeight`和`window.outerWidth`属性返回浏览器窗口的高度和宽度，包括浏览器菜单和边框（单位像素）。这两个属性只读。

#### **（4）window.scrollX，window.scrollY**

`window.scrollX`属性返回页面的水平滚动距离，`window.scrollY`属性返回页面的垂直滚动距离，单位都为像素。这两个属性只读。

注意，这两个属性的返回值不是整数，而是双精度浮点数。如果页面没有滚动，它们的值就是`0`。

举例来说，如果用户向下拉动了垂直滚动条75像素，那么`window.scrollY`就是75左右。用户水平向右拉动水平滚动条200像素，`window.scrollX`就是200左右。

```js
if (window.scrollY < 75) {
  window.scroll(0, 75);
}
```

上面代码中，如果页面向下滚动的距离小于75像素，那么页面向下滚动75像素。

#### **（5）window.pageXOffset，window.pageYOffset**

`window.pageXOffset`属性和`window.pageYOffset`属性，是`window.scrollX`和`window.scrollY`别名。

### 事件

`window`对象可以接收以下事件。

#### load 事件和 onload 属性

`load`事件发生在文档在浏览器窗口加载完毕时。`window.onload`属性可以指定这个事件的回调函数。

```js
window.onload = function() {...}
```

#### error 事件和 onerror 属性

浏览器脚本发生错误时，会触发`window`对象的`error`事件。我们可以通过`window.onerror`属性对该事件指定回调函数。

### 方法

`window.alert()`、`window.prompt()`、`window.confirm()`都是浏览器与用户互动的全局方法。它们会弹出不同的对话框，要求用户做出回应。注意，这三个方法弹出的对话框，都是浏览器统一规定的式样，无法定制。

这三个方法都具有堵塞效应，一旦弹出对话框，整个页面就是暂停执行，等待用户做出反应。

#### window.alert()

`window.alert()`方法弹出的对话框，只有一个“确定”按钮，往往用来通知用户某些信息。

可以用`\n`指定换行。

#### window.prompt()

`window.prompt()`方法弹出的对话框，提示文字的下方，还有一个输入框，要求用户输入信息，并有“确定”和“取消”两个按钮。它往往用来获取用户输入的数据。

```js
var result = prompt('您的年龄？', 25)
```

上面代码会跳出一个对话框，文字提示为“您的年龄？”，要求用户在对话框中输入自己的年龄（默认显示25）。用户填入的值，会作为返回值存入变量`result`。

`window.prompt()`方法的第二个参数是可选的，但是最好总是提供第二个参数，作为输入框的默认值。

#### window.confirm()

`window.confirm()`方法弹出的对话框，除了提示信息之外，只有“确定”和“取消”两个按钮，往往用来征询用户是否同意。

`confirm`方法返回一个布尔值，如果用户点击“确定”，返回`true`；如果用户点击“取消”，则返回`false`。

#### window.open()

`window.open`方法用于新建另一个浏览器窗口，类似于浏览器菜单的新建窗口选项。它会返回新窗口的引用，如果无法新建窗口，则返回`null`。

```js
var popup = window.open('somefile.html');
```

上面代码会让浏览器弹出一个新建窗口，网址是当前域名下的`somefile.html`。

`open`方法一共可以接受三个参数。

```js
window.open(url, windowName, [windowFeatures])
```

- `url`：字符串，表示新窗口的网址。如果省略，默认网址就是`about:blank`。
- `windowName`：字符串，表示新窗口的名字。如果该名字的窗口已经存在，则占用该窗口，不再新建窗口。如果省略，就默认使用`_blank`，表示新建一个没有名字的窗口。另外还有几个预设值，`_self`表示当前窗口，`_top`表示顶层窗口，`_parent`表示上一层窗口。
- `windowFeatures`：字符串，内容为逗号分隔的键值对（详见下文），表示新窗口的参数，比如有没有提示栏、工具条等等。如果省略，则默认打开一个完整 UI 的新窗口。如果新建的是一个已经存在的窗口，则该参数不起作用，浏览器沿用以前窗口的参数。

```js
var popup = window.open(
  'somepage.html',
  'DefinitionsWindows',
  'height=200,width=200,location=no,status=yes,resizable=yes,scrollbars=yes'
);
```

上面代码表示，打开的新窗口高度和宽度都为200像素，没有地址栏，但有状态栏和滚动条，允许用户调整大小。

第三个参数可以设定如下属性。

- left：新窗口距离屏幕最左边的距离（单位像素）。注意，新窗口必须是可见的，不能设置在屏幕以外的位置。
- top：新窗口距离屏幕最顶部的距离（单位像素）。
- height：新窗口内容区域的高度（单位像素），不得小于100。
- width：新窗口内容区域的宽度（单位像素），不得小于100。
- outerHeight：整个浏览器窗口的高度（单位像素），不得小于100。
- outerWidth：整个浏览器窗口的宽度（单位像素），不得小于100。
- menubar：是否显示菜单栏。
- toolbar：是否显示工具栏。
- location：是否显示地址栏。
- personalbar：是否显示用户自己安装的工具栏。
- status：是否显示状态栏。
- dependent：是否依赖父窗口。如果依赖，那么父窗口最小化，该窗口也最小化；父窗口关闭，该窗口也关闭。
- minimizable：是否有最小化按钮，前提是`dialog=yes`。
- noopener：新窗口将与父窗口切断联系，即新窗口的`window.opener`属性返回`null`，父窗口的`window.open()`方法也返回`null`。
- resizable：新窗口是否可以调节大小。
- scrollbars：是否允许新窗口出现滚动条。
- dialog：新窗口标题栏是否出现最大化、最小化、恢复原始大小的控件。
- titlebar：新窗口是否显示标题栏。
- alwaysRaised：是否显示在所有窗口的顶部。
- alwaysLowered：是否显示在父窗口的底下。
- close：新窗口是否显示关闭按钮。

对于那些可以打开和关闭的属性，设为`yes`或`1`或不设任何值就表示打开，比如`status=yes`、`status=1`、`status`都会得到同样的结果。如果想设为关闭，不用写`no`，而是直接省略这个属性即可。也就是说，如果在第三个参数中设置了一部分属性，其他没有被设置的`yes/no`属性都会被设成`no`，只有`titlebar`和关闭按钮除外（它们的值默认为`yes`）。

上面这些属性，属性名与属性值之间用等号连接，属性与属性之间用逗号分隔。

```js
'height=200,width=200,location=no,status=yes,resizable=yes,scrollbars=yes'
```

另外，`open()`方法的第二个参数虽然可以指定已经存在的窗口，但是不等于可以任意控制其他窗口。为了防止被不相干的窗口控制，浏览器只有在两个窗口同源，或者目标窗口被当前网页打开的情况下，才允许`open`方法指向该窗口。

`window.open`方法返回新窗口的引用。

```js
var windowB = window.open('windowB.html', 'WindowB');
windowB.window.name // "WindowB"
```

注意，如果新窗口和父窗口不是同源的（即不在同一个域），它们彼此不能获取对方窗口对象的内部属性。

```js
var w = window.open();
console.log('已经打开新窗口');
w.location = 'http://example.com';
```

上面代码先打开一个新窗口，然后在该窗口弹出一个对话框，再将网址导向`example.com`。

由于`open`这个方法很容易被滥用，**许多浏览器默认都不允许脚本自动新建窗口**。

只允许在用户点击链接或按钮时，脚本做出反应，弹出新窗口。因此，有必要检查一下打开新窗口是否成功。

```js
var popup = window.open();
if (popup === null) {
  // 新建窗口失败
}
```

#### window.close()

`window.close`方法用于关闭当前窗口，一般只用来关闭`window.open`方法新建的窗口。

```js
popup.close()
```

该方法只对顶层窗口有效，`iframe`框架之中的窗口使用该方法无效。

#### window.stop()

`window.stop()`方法完全等同于单击浏览器的停止按钮，会停止加载图像、视频等正在或等待加载的对象。

#### window.moveTo()

`window.moveTo()`方法用于移动浏览器窗口到指定位置。它接受两个参数，分别是窗口左上角距离屏幕左上角的水平距离和垂直距离，单位为像素。

```js
window.moveTo(100, 200)
```

上面代码将窗口移动到屏幕`(100, 200)`的位置。

#### window.moveBy()

`window.moveBy()`方法将窗口移动到一个相对位置。它接受两个参数，分别是窗口左上角向右移动的水平距离和向下移动的垂直距离，单位为像素。

```js
window.moveBy(25, 50)
```

上面代码将窗口向右移动25像素、向下移动50像素。

为了防止有人滥用这两个方法，随意移动用户的窗口，目前只有一种情况，浏览器允许用脚本移动窗口：该窗口是用`window.open()`方法新建的，并且窗口里只有它一个 Tab 页。除此以外的情况，使用上面两个方法都是无效的。

#### window.resizeTo()

`window.resizeTo()`方法用于缩放窗口到指定大小。

#### window.resizeBy()

`window.resizeBy()`方法用于缩放窗口。它与`window.resizeTo()`的区别是，它按照相对的量缩放，`window.resizeTo()`需要给出缩放后的绝对大小。

#### window.scrollTo()

`window.scrollTo`方法用于将文档滚动到指定位置。它接受两个参数，表示滚动后位于窗口左上角的页面坐标。

```js
window.scrollTo(x-coord, y-coord)
```

它也可以接受一个配置对象作为参数。

```js
window.scrollTo(options)
```

配置对象`options`有三个属性。

- `top`：滚动后页面左上角的垂直坐标，即 y 坐标。
- `left`：滚动后页面左上角的水平坐标，即 x 坐标。
- `behavior`：字符串，表示滚动的方式，有三个可能值（`smooth`、`instant`、`auto`），默认值为`auto`。

```js
window.scrollTo({
  top: 1000,
  behavior: 'smooth'
});
```

#### window.scroll()

`window.scroll()`方法是`window.scrollTo()`方法的别名。

#### window.scrollBy()

`window.scrollBy()`方法用于将网页滚动指定距离（单位像素）。它接受两个参数：水平向右滚动的像素，垂直向下滚动的像素。

```js
window.scrollBy(0, window.innerHeight)
```

上面代码用于将网页向下滚动一屏。

如果不是要滚动整个文档，而是要滚动某个元素，可以使用下面三个属性和方法。

- Element.scrollTop
- Element.scrollLeft
- Element.scrollIntoView()

#### window.print()

`window.print`方法会跳出打印对话框，与用户点击菜单里面的“打印”命令效果相同。

#### window.focus()

`window.focus()`方法会激活窗口，使其获得焦点，出现在其他窗口的前面。

#### window.blur()	

`window.blur()`方法将焦点从窗口移除。

#### window.getSelection()

`window.getSelection`方法返回一个`Selection`对象，表示用户现在选中的文本。

使用`Selection`对象的`toString`方法可以得到选中的文本。

```js
window.getSelection().toString()
```

#### window.getComputedStyle()

`window.getComputedStyle()`方法接受一个元素节点作为参数，返回一个包含该元素的最终样式信息的对象

#### window.matchMedia() 

`window.matchMedia()`方法用来检查 CSS 的`mediaQuery`语句

#### window.requestAnimationFrame()

`window.requestAnimationFrame()`方法跟`setTimeout`类似，都是推迟某个函数的执行。

不同之处在于，`setTimeout`必须指定推迟的时间，`window.requestAnimationFrame()`则是推迟到浏览器下一次重流时执行，执行完才会进行下一次重绘。

重绘通常是 16ms 执行一次，不过浏览器会自动调节这个速率，比如网页切换到后台 Tab 页时，`requestAnimationFrame()`会暂停执行。

如果某个函数会改变网页的布局，一般就放在`window.requestAnimationFrame()`里面执行，这样可以节省系统资源，使得网页效果更加平滑。

因为慢速设备会用较慢的速率重流和重绘，而速度更快的设备会有更快的速率。

该方法接受一个回调函数作为参数。

```js
window.requestAnimationFrame(callback)
```

上面代码中，`callback`是一个回调函数。`callback`执行时，它的参数就是系统传入的一个高精度时间戳（`performance.now()`的返回值），单位是毫秒，表示距离网页加载的时间。

`window.requestAnimationFrame()`的返回值是一个整数，这个整数可以传入`window.cancelAnimationFrame()`，用来取消回调函数的执行。

下面是一个`window.requestAnimationFrame()`执行网页动画的例子。

```js
var element = document.getElementById('animate');
element.style.position = 'absolute';

var start = null;

function step(timestamp) {
  if (!start) start = timestamp;
  var progress = timestamp - start;
  // 元素不断向右移，最大不超过200像素
  element.style.left = Math.min(progress / 10, 200) + 'px';
  // 如果距离第一次执行不超过 2000 毫秒，
  // 就继续执行动画
  if (progress < 2000) {
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
```

上面代码定义了一个网页动画，持续时间是2秒，会让元素向右移动。

#### window.requestIdleCallback()

`window.requestIdleCallback()`跟`setTimeout`类似，也是将某个函数推迟执行，但是它保证将回调函数推迟到系统资源空闲时执行。

也就是说，如果某个任务不是很关键，就可以使用`window.requestIdleCallback()`将其推迟执行，以保证网页性能。

它跟`window.requestAnimationFrame()`的区别在于，后者指定回调函数在下一次浏览器重排时执行，问题在于下一次重排时，系统资源未必空闲，不一定能保证在16毫秒之内完成；`window.requestIdleCallback()`可以保证回调函数在系统资源空闲时执行。

该方法接受一个回调函数和一个配置对象作为参数。配置对象可以指定一个推迟执行的最长时间，如果过了这个时间，回调函数不管系统资源有无空闲，都会执行。

```js
window.requestIdleCallback(callback[, options])
```

`callback`参数是一个回调函数。该回调函数执行时，系统会传入一个`IdleDeadline`对象作为参数。`IdleDeadline`对象有一个`didTimeout`属性（布尔值，表示是否为超时调用）和一个`timeRemaining()`方法（返回该空闲时段剩余的毫秒数）。

`options`参数是一个配置对象，目前只有`timeout`一个属性，用来指定回调函数推迟执行的最大毫秒数。该参数可选。

`window.requestIdleCallback()`方法返回一个整数。该整数可以传入`window.cancelIdleCallback()`取消回调函数。

## Navigator 对象

`window.navigator`属性指向一个包含浏览器和系统信息的 Navigator 对象。脚本通过这个属性了解用户的环境信息。

### 属性

#### Navigator.userAgent

`navigator.userAgent`属性返回浏览器的 User Agent 字符串，表示用户设备信息，包含了浏览器的厂商、版本、操作系统等信息。

```js
navigator.userAgent
// 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
```

**识别手机浏览器**:

```js
var ua = navigator.userAgent.toLowerCase();

if (/mobi/.test(ua)) {
  // 手机浏览器
} else {
  // 非手机浏览器
}
```

如果想要识别所有移动设备的浏览器，可以测试更多的特征字符串。

```js
/mobi|android|touch|mini/.test(ua)
```

#### Navigator.plugins

`Navigator.plugins`属性返回一个类似数组的对象，成员是 Plugin 实例对象，表示浏览器安装的插件，比如 Flash、ActiveX 等。

#### Navigator.platform

`Navigator.platform`属性返回用户的操作系统信息，比如`MacIntel`、`Win32`、`Linux x86_64`等 。

#### Navigator.onLine

`navigator.onLine`属性返回一个布尔值，表示用户当前在线还是离线（浏览器断线）。

有时，浏览器可以连接局域网，但是局域网不能连通外网。这时，有的浏览器的`onLine`属性会返回`true`，所以不能假定只要是`true`，用户就一定能访问互联网。不过，如果是`false`，可以断定用户一定离线。

用户变成在线会触发`online`事件，变成离线会触发`offline`事件，可以通过`window.ononline`和`window.onoffline`指定这两个事件的回调函数。

```js
window.addEventListener('offline', function(e) { console.log('offline'); });
window.addEventListener('online', function(e) { console.log('online'); });
```

#### Navigator.language

`Navigator.language`属性返回一个字符串，表示浏览器的首选语言。该属性只读。

#### Navigator.languages

`Navigator.languages`属性返回一个数组，表示用户可以接受的语言。

`Navigator.language`总是这个数组的第一个成员。HTTP 请求头信息的`Accept-Language`字段，就来自这个数组。

如果这个属性发生变化，就会在`window`对象上触发`languagechange`事件。

#### Navigator.geolocation

`Navigator.geolocation`属性返回一个 Geolocation 对象，包含用户地理位置的信息。注意，该 API 只有在 HTTPS 协议下可用，否则调用下面方法时会报错。

Geolocation 对象提供下面三个方法。

- Geolocation.getCurrentPosition()：得到用户的当前位置
- Geolocation.watchPosition()：监听用户位置变化
- Geolocation.clearWatch()：取消`watchPosition()`方法指定的监听函数

注意，调用这三个方法时，浏览器会跳出一个对话框，要求用户给予授权。

#### Navigator.cookieEnabled

`navigator.cookieEnabled`属性返回一个布尔值，表示浏览器的 Cookie 功能是否打开。

### 方法

#### Navigator.javaEnabled()

`navigator.javaEnabled()`方法返回一个布尔值，表示浏览器是否能运行 Java Applet 小程序。

#### Navigator.sendBeacon()

`Navigator.sendBeacon()`方法用于向服务器异步发送数据。

### 实验性属性

Navigator 对象有一些实验性属性，在部分浏览器可用。

#### Navigator.deviceMemory 

`navigator.deviceMemory`属性返回当前计算机的内存数量（单位为 GB）。该属性只读，只在 HTTPS 环境下可用。

它的返回值是一个近似值，四舍五入到最接近的2的幂，通常是 0.25、0.5、1、2、4、8。实际内存超过 8GB，也返回`8`。

```js
if (navigator.deviceMemory > 1) {
  await import('./costly-module.js');
}
```

上面示例中，只有当前内存大于 1GB，才加载大型的脚本。

#### Navigator.hardwareConcurrency

`navigator.hardwareConcurrency`属性返回用户计算机上可用的逻辑处理器的数量。该属性只读。

现代计算机的 CPU 有多个物理核心，每个物理核心有时支持一次运行多个线程。因此，四核 CPU 可以提供八个逻辑处理器核心。

可用于判断是否加载大型脚本。

该属性通过用于创建 Web Worker，每个可用的逻辑处理器都创建一个 Worker。

```js
let workerList = [];

for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
  let newWorker = {
    worker: new Worker('cpuworker.js'),
    inUse: false
  };
  workerList.push(newWorker);
}
```

上面示例中，有多少个可用的逻辑处理器，就创建多少个 Web Worker。

#### Navigator.connection

`navigator.connection`属性返回一个对象，包含当前网络连接的相关信息。

- downlink：有效带宽估计值（单位：兆比特/秒，Mbps），四舍五入到每秒 25KB 的最接近倍数。
- downlinkMax：当前连接的最大下行链路速度（单位：兆比特每秒，Mbps）。
- effectiveType：返回连接的等效类型，可能的值为`slow-2g`、`2g`、`3g`、`4g`。
- rtt：当前连接的估计有效往返时间，四舍五入到最接近的25毫秒的倍数。
- saveData：用户是否设置了浏览器的减少数据使用量选项（比如不加载图片），返回`true`或者`false`。
- type：当前连接的介质类型，可能的值为`bluetooth`、`cellular`、`ethernet`、`none`、`wifi`、`wimax`、`other`、`unknown`。

## Screen 对象

Screen 对象表示当前窗口所在的屏幕，提供显示设备的信息。`window.screen`属性指向这个对象。

该对象有下面的属性。

- `Screen.height`：浏览器窗口所在的屏幕的高度（单位像素）。除非调整显示器的分辨率，否则这个值可以看作常量，不会发生变化。显示器的分辨率与浏览器设置无关，缩放网页并不会改变分辨率。
- `Screen.width`：浏览器窗口所在的屏幕的宽度（单位像素）。
- `Screen.availHeight`：浏览器窗口可用的屏幕高度（单位像素）。因为部分空间可能不可用，比如系统的任务栏或者 Mac 系统屏幕底部的 Dock 区，这个属性等于`height`减去那些被系统组件的高度。
- `Screen.availWidth`：浏览器窗口可用的屏幕宽度（单位像素）。
- `Screen.pixelDepth`：整数，表示屏幕的色彩位数，比如`24`表示屏幕提供24位色彩。
- `Screen.colorDepth`：`Screen.pixelDepth`的别名。严格地说，colorDepth 表示应用程序的颜色深度，pixelDepth 表示屏幕的颜色深度，绝大多数情况下，它们都是同一件事。
- `Screen.orientation`：返回一个对象，表示屏幕的方向。该对象的`type`属性是一个字符串，表示屏幕的具体方向，`landscape-primary`表示横放，`landscape-secondary`表示颠倒的横放，`portrait-primary`表示竖放，`portrait-secondary`表示颠倒的竖放。

```js
if (window.screen.width >= 1024 && window.screen.height >= 768) {
  // 分辨率不低于 1024x768
}
```

根据屏幕的宽度，将用户导向不同网页的代码。

```js
if ((screen.width <= 800) && (screen.height <= 600)) {
  window.location.replace('small.html');
} else {
  window.location.replace('wide.html');
}
```

## Cookie

### 概述

Cookie 是服务器保存在浏览器的一小段文本信息，一般大小不能超过4KB。浏览器每次向服务器发出请求，就会自动附上这段信息。

HTTP 协议不带有状态，有些请求需要区分状态，就通过 Cookie 附带字符串，让服务器返回不一样的回应。举例来说，用户登录以后，服务器往往会在网站上留下一个 Cookie，记录用户编号（比如`id=1234`），以后每次浏览器向服务器请求数据，就会带上这个字符串，服务器从而知道是谁在请求，应该回应什么内容。

Cookie 的目的就是区分用户，以及放置状态信息，它的使用场景主要如下。

- 对话（session）管理：保存登录状态、购物车等需要记录的信息。
- 个性化信息：保存用户的偏好，比如网页的字体大小、背景色等等。
- 追踪用户：记录和分析用户行为。

Cookie 不是一种理想的客户端存储机制。它的容量很小（4KB），缺乏数据操作接口，而且会影响性能。客户端存储建议使用 Web storage API 和 IndexedDB。**只有那些每次请求都需要让服务器知道的信息，才应该放在 Cookie 里面。**

每个 Cookie 都有以下几方面的元数据。

- Cookie 的名字
- Cookie 的值（真正的数据写在这里面）
- 到期时间（超过这个时间会失效）
- 所属域名（默认为当前域名）
- 生效的路径（默认为当前网址）

举例来说，用户访问网址`www.example.com`，服务器在浏览器写入一个 Cookie。这个 Cookie 的所属域名为`www.example.com`，生效路径为根路径`/`。

如果 Cookie 的生效路径设为`/forums`，那么这个 Cookie 只有在访问`www.example.com/forums`及其子路径时才有效。

以后，浏览器访问某个路径之前，就会找出对该域名和路径有效，并且还没有到期的 Cookie，一起发送给服务器。

用户可以设置浏览器不接受 Cookie，也可以设置不向服务器发送 Cookie。

`window.navigator.cookieEnabled`属性返回一个布尔值，表示浏览器是否打开 Cookie 功能。

`document.cookie`属性返回当前网页的 Cookie。

```js
window.navigator.cookieEnabled // true
document.cookie // "id=foo;key=bar"
```

不同浏览器对 Cookie 数量和大小的限制，是不一样的。一般来说，单个域名设置的 Cookie 不应超过30个，每个 Cookie 的大小不能超过 4KB。超过限制以后，Cookie 将被忽略，不会被设置。

Cookie 是按照域名区分的，`foo.com`只能读取自己放置的 Cookie，无法读取其他网站（比如`bar.com`）放置的 Cookie。

一般情况下，一级域名也不能读取二级域名留下的 Cookie，比如`mydomain.com`不能读取`subdomain.mydomain.com`设置的 Cookie。

但是有一个例外，设置 Cookie 的时候（不管是一级域名设置的，还是二级域名设置的），明确将`domain`属性设为一级域名，则这个域名下面的各级域名可以共享这个 Cookie。

```http
Set-Cookie: name=value; domain=mydomain.com
```

上面示例中，设置 Cookie 时，`domain`属性设为`mydomain.com`，那么各级的子域名和一级域名都可以读取这个 Cookie。

注意，区分 Cookie 时不考虑协议和端口。也就是说，`http://example.com`设置的 Cookie，可以被`https://example.com`或`http://example.com:8080`读取。

### Cookie & HTTP

Cookie 由 HTTP 协议生成，也主要是供 HTTP 协议使用。

#### 回应 & 生成

服务器如果希望在浏览器保存 Cookie，就要在 HTTP 回应的头信息里面，放置一个`Set-Cookie`字段。

```http
Set-Cookie:foo=bar
```

上面代码会在浏览器保存一个名为`foo`的 Cookie，它的值为`bar`。

HTTP 回应可以包含多个`Set-Cookie`字段，即在浏览器生成多个 Cookie。下面是一个例子。

```http
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: yummy_cookie=choco
Set-Cookie: tasty_cookie=strawberry

[page content]
```

除了 Cookie 的值，`Set-Cookie`字段还可以附加 Cookie 的属性。

```http
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
```

一个`Set-Cookie`字段里面，可以同时包括多个属性，没有次序的要求。

```http
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly
```

**例子**:

```http
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
```

如果服务器想改变一个早先设置的 Cookie，必须同时满足四个条件：Cookie 的`key`、`domain`、`path`和`secure`都匹配。

举例来说，如果原始的 Cookie 是用如下的`Set-Cookie`设置的。

```http
Set-Cookie: key1=value1; domain=example.com; path=/blog
```

改变上面这个 Cookie 的值，就必须使用同样的`Set-Cookie`。

```http
Set-Cookie: key1=value2; domain=example.com; path=/blog
```

只要有一个属性不同，就会生成一个全新的 Cookie，而不是替换掉原来那个 Cookie。

```http
Set-Cookie: key1=value2; domain=example.com; path=/
```

上面的命令设置了一个全新的同名 Cookie，但是`path`属性不一样。下一次访问`example.com/blog`的时候，浏览器将向服务器发送两个同名的 Cookie。

#### 请求 & 发送

浏览器向服务器发送 HTTP 请求时，每个请求都会带上相应的 Cookie。

也就是说，把服务器早前保存在浏览器的这段信息，再发回服务器。这时要使用 HTTP 头信息的`Cookie`字段。

```http
Cookie: foo=bar
```

上面代码会向服务器发送名为`foo`的 Cookie，值为`bar`。

`Cookie`字段可以包含多个 Cookie，使用分号（`;`）分隔。

```http
Cookie: name=value; name2=value2; name3=value3
```

下面是一个例子。

```http
GET /sample_page.html HTTP/1.1
Host: www.example.org
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```

服务器收到浏览器发来的 Cookie 时，有两点是无法知道的。

- Cookie 的各种属性，比如何时过期。
- 哪个域名设置的 Cookie，到底是一级域名设的，还是某一个二级域名设的。

### Cookie 的属性

#### Expires

`Expires`属性指定一个具体的到期时间，到了指定时间以后，浏览器就不再保留这个 Cookie。它的值是 UTC 格式，可以使用`Date.prototype.toUTCString()`进行格式转换。

如果不设置该属性，或者设为`null`，Cookie 只在当前会话（session）有效，浏览器窗口一旦关闭，当前 Session 结束，该 Cookie 就会被删除。

#### Max-Age

`Max-Age`属性指定从现在开始 Cookie 存在的秒数，比如`60 * 60 * 24 * 365`（即一年）。过了这个时间以后，浏览器就不再保留这个 Cookie。

如果同时指定了`Expires`和`Max-Age`，那么`Max-Age`的值将优先生效。

#### Domain

`Domain`属性指定 Cookie 属于哪个域名，以后浏览器向服务器发送 HTTP 请求时，通过这个属性判断是否要附带某个 Cookie。

#### Path

`Path`属性指定浏览器发出 HTTP 请求时，哪些路径要附带这个 Cookie。

#### Secure

`Secure`属性指定浏览器只有在加密协议 HTTPS 下，才能将这个 Cookie 发送到服务器。

#### HttpOnly

`HttpOnly`属性指定该 Cookie 无法通过 JavaScript 脚本拿到，主要是`document.cookie`属性、`XMLHttpRequest`对象和 Request API 都拿不到该属性。这样就防止了该 Cookie 被脚本读到，只有浏览器发出 HTTP 请求时，才会带上该 Cookie。

#### SameSite

Chrome 51 开始，浏览器的 Cookie 新增加了一个`SameSite`属性，用来防止 CSRF 攻击和用户追踪。

Cookie 往往用来存储用户的身份信息，恶意网站可以设法伪造带有正确 Cookie 的 HTTP 请求，这就是 CSRF 攻击。

### document.cookie

`document.cookie`属性用于读写当前网页的 Cookie。

读取的时候，它会返回当前网页的所有 Cookie，前提是该 Cookie 不能有`HTTPOnly`属性。

## XMLHttpRequest 对象

浏览器与服务器之间，采用 HTTP 协议通信。用户在浏览器地址栏键入一个网址，或者通过网页表单向服务器提交内容，这时浏览器就会向服务器发出 HTTP 请求。

JavaScript 脚本向服务器发起 HTTP 请求。AJAX 这个词第一次正式提出，它是 Asynchronous JavaScript and XML 的缩写，指的是通过 JavaScript 的异步通信，从服务器获取 XML 文档从中提取数据，再更新当前网页的对应部分，而不用刷新整个网页。

后来，AJAX 这个词就成为 JavaScript 脚本发起 HTTP 通信的代名词，也就是说，只要用脚本发起通信，就可以叫做 AJAX 通信。

概括起来，就是一句话，AJAX 通过原生的`XMLHttpRequest`对象发出 HTTP 请求，得到服务器返回的数据后，再进行处理。

现在，服务器返回的都是 JSON 格式的数据，XML 格式已经过时了，但是 AJAX 这个名字已经成了一个通用名词，字面含义已经消失了。

`XMLHttpRequest`对象是 AJAX 的主要接口，用于浏览器与服务器之间的通信。尽管名字里面有`XML`和`Http`，它实际上可以使用多种协议（比如`file`或`ftp`），发送任何格式的数据（包括字符串和二进制）。

`XMLHttpRequest`本身是一个构造函数，可以使用`new`命令生成实例。它没有任何参数。

```js
var xhr = new XMLHttpRequest();
```

一旦新建实例，就可以使用`open()`方法指定建立 HTTP 连接的一些细节。

```js
xhr.open('GET', 'http://www.example.com/page.php', true);
```

上面代码指定使用 GET 方法，跟指定的服务器网址建立连接。第三个参数`true`，表示请求是异步的。

然后，指定回调函数，监听通信状态（`readyState`属性）的变化。

```js
xhr.onreadystatechange = handleStateChange;

function handleStateChange() {
  // ...
}
```

上面代码中，一旦`XMLHttpRequest`实例的状态发生变化，就会调用监听函数`handleStateChange`

最后使用`send()`方法，实际发出请求。

```js
xhr.send(null);
```

上面代码中，`send()`的参数为`null`，表示发送请求的时候，不带有数据体。如果发送的是 POST 请求，这里就需要指定数据体。

一旦拿到服务器返回的数据，AJAX 不会刷新整个网页，而是只更新网页里面的相关部分，从而不打断用户正在做的事情。

**注意**，AJAX 只能向**同源网址**（协议、域名、端口都相同）发出 HTTP 请求，如果发出跨域请求，就会报错。

下面是`XMLHttpRequest`对象简单用法的完整例子：

```js
var xhr = new XMLHttpRequest();

xhr.onreadystatechange = function(){
  // 通信成功时，状态值为4
  if (xhr.readyState === 4){
    if (xhr.status === 200){
      console.log(xhr.responseText);
    } else {
      console.error(xhr.statusText);
    }
  }
};

xhr.onerror = function (e) {
  console.error(xhr.statusText);
};

xhr.open('GET', '/endpoint', true);
xhr.send(null);
```

### 实例属性

#### XMLHttpRequest.readyState 

`XMLHttpRequest.readyState`返回一个整数，表示实例对象的当前状态。该属性只读。它可能返回以下值。

- 0，表示 XMLHttpRequest 实例已经生成，但是实例的`open()`方法还没有被调用。
- 1，表示`open()`方法已经调用，但是实例的`send()`方法还没有调用，仍然可以使用实例的`setRequestHeader()`方法，设定 HTTP 请求的头信息。
- 2，表示实例的`send()`方法已经调用，并且服务器返回的头信息和状态码已经收到。
- 3，表示正在接收服务器传来的数据体（body 部分）。这时，如果实例的`responseType`属性等于`text`或者空字符串，`responseText`属性就会包含已经收到的部分信息。
- 4，表示服务器返回的数据已经完全接收，或者本次接收已经失败。

通信过程中，每当实例对象发生状态变化，它的`readyState`属性的值就会改变。这个值每一次变化，都会触发`readyStateChange`事件。

```js
if (xhr.readyState === 4) {
  // ...
} else {
  // ...
}
```

#### XMLHttpRequest.onreadystatechange

`XMLHttpRequest.onreadystatechange`属性指向一个监听函数。`readystatechange`事件发生时（实例的`readyState`属性变化），就会执行这个属性。

另外，如果使用实例的`abort()`方法，终止 XMLHttpRequest 请求，也会造成`readyState`属性变化，导致调用`XMLHttpRequest.onreadystatechange`属性。

```js
xhr.onreadystatechange = function () {
  if (xhr.readyState !== 4 || xhr.status !== 200) {
    return;
  }
```

#### XMLHttpRequest.response

`XMLHttpRequest.response`属性表示服务器返回的数据体（即 HTTP 回应的 body 部分）。

它可能是任何数据类型，比如字符串、对象、二进制对象等等，具体的类型由`XMLHttpRequest.responseType`属性决定。该属性只读。

如果本次请求没有成功或者数据不完整，该属性等于`null`。但是，如果`responseType`属性等于`text`或空字符串，在请求没有结束之前（`readyState`等于3的阶段），`response`属性包含服务器已经返回的部分数据。

#### XMLHttpRequest.responseType

`XMLHttpRequest.responseType`属性是一个字符串，表示服务器返回数据的类型。

这个属性是可写的，可以在调用`open()`方法之后、调用`send()`方法之前，设置这个属性的值，告诉浏览器如何解读返回的数据。如果`responseType`设为空字符串，就等同于默认值`text`。

`XMLHttpRequest.responseType`属性可以等于以下值。

- ""（空字符串）：等同于`text`，表示服务器返回文本数据。
- "arraybuffer"：ArrayBuffer 对象，表示服务器返回二进制数组。
- "blob"：Blob 对象，表示服务器返回二进制对象。
- "document"：Document 对象，表示服务器返回一个文档对象。
- "json"：JSON 对象。
- "text"：字符串。

#### XMLHttpRequest.responseText

`XMLHttpRequest.responseText`属性返回从服务器接收到的字符串，该属性为只读。只有 HTTP 请求完成接收以后，该属性才会包含完整的数据。

#### XMLHttpRequest.responseXML

`XMLHttpRequest.responseXML`属性返回从服务器接收到的 HTML 或 XML 文档对象，该属性为只读。如果本次请求没有成功，或者收到的数据不能被解析为 XML 或 HTML，该属性等于`null`。

#### XMLHttpRequest.responseURL

`XMLHttpRequest.responseURL`属性是字符串，表示发送数据的服务器的网址。

注意，这个属性的值与`open()`方法指定的请求网址不一定相同。如果服务器端发生跳转，这个属性返回最后实际返回数据的网址。另外，如果原始 URL 包括锚点（fragment），该属性会把锚点剥离。

#### XMLHttpRequest.status

`XMLHttpRequest.status`属性返回一个整数，表示服务器回应的 HTTP 状态码。

一般来说，如果通信成功的话，这个状态码是200；如果服务器没有返回状态码，那么这个属性默认是200。请求发出之前，该属性为`0`。该属性只读。

##### HTTP状态码

| HTTP 状态码 | 状态描述              | 含义           |
| ----------- | --------------------- | -------------- |
| 200         | OK                    | 访问正常       |
| 301         | Moved Permanently     | 永久移动       |
| 302         | Moved temporarily     | 暂时移动       |
| 304         | Not Modified          | 未修改         |
| 307         | Temporary Redirect    | 暂时重定向     |
| 401         | Unauthorized          | 未授权         |
| 403         | Forbidden             | 禁止访问       |
| 404         | Not Found             | 未发现指定网址 |
| 500         | Internal Server Error | 服务器发生错误 |

基本上，只有2xx和304的状态码，表示服务器返回是正常状态。

```js
if (xhr.readyState === 4) {
  if ( (xhr.status >= 200 && xhr.status < 300)
    || (xhr.status === 304) ) {
    // 处理服务器的返回数据
  } else {
    // 出错
  }
}
```

#### XMLHttpRequest.statusText

`XMLHttpRequest.statusText`属性返回一个字符串，表示服务器发送的状态提示。不同于`status`属性，该属性包含整个状态信息，比如“OK”和“Not Found”。

#### XMLHttpRequest.timeout

`XMLHttpRequest.timeout`属性返回一个整数，表示多少毫秒后，如果请求仍然没有得到结果，就会自动终止。如果该属性等于0，就表示没有时间限制。

#### XMLHttpRequestEventTarget.ontimeout

`XMLHttpRequestEventTarget.ontimeout`属性用于设置一个监听函数，如果发生 timeout 事件，就会执行这个监听函数。

```js
xhr.timeout = 10 * 1000; // 指定 10 秒钟超时
xhr.ontimeout = function () {
  console.error('The request timed out.');
};
```

### 事件监听

XMLHttpRequest 对象可以对以下事件指定监听函数。

- XMLHttpRequest.onloadstart：loadstart 事件（HTTP 请求发出）的监听函数
- XMLHttpRequest.onprogress：progress事件（正在发送和加载数据）的监听函数
- XMLHttpRequest.onabort：abort 事件（请求中止，比如用户调用了`abort()`方法）的监听函数
- XMLHttpRequest.onerror：error 事件（请求失败）的监听函数
- XMLHttpRequest.onload：load 事件（请求成功完成）的监听函数
- XMLHttpRequest.ontimeout：timeout 事件（用户指定的时限超过了，请求还未完成）的监听函数
- XMLHttpRequest.onloadend：loadend 事件（请求完成，不管成功或失败）的监听函数

```js
xhr.onprogress = function (event) {
  console.log(event.loaded);
  console.log(event.total);
};
```

`progress`事件的监听函数有一个事件对象参数，该对象有三个属性：`loaded`属性返回已经传输的数据量，`total`属性返回总的数据量，`lengthComputable`属性返回一个布尔值，表示加载的进度是否可以计算。

所有这些监听函数里面，只有`progress`事件的监听函数有参数，其他函数都没有参数。

注意，如果发生网络错误（比如服务器无法连通），`onerror`事件无法获取报错信息。也就是说，可能没有错误对象，所以这样只能显示报错的提示。

### XMLHttpRequest.withCredentials

`XMLHttpRequest.withCredentials`属性是一个布尔值，表示跨域请求时，用户信息（比如 Cookie 和认证的 HTTP 头信息）是否会包含在请求之中，默认为`false`，即向`example.com`发出跨域请求时，不会发送`example.com`设置在本机上的 Cookie（如果有的话）。

如果需要跨域 AJAX 请求发送 Cookie，需要`withCredentials`属性设为`true`。注意，同源的请求不需要设置这个属性。

### XMLHttpRequest.upload

XMLHttpRequest 不仅可以发送请求，还可以发送文件，这就是 AJAX 文件上传。

发送文件以后，通过`XMLHttpRequest.upload`属性可以得到一个对象，通过观察这个对象，可以得知上传的进展。

主要方法就是监听这个对象的各种事件：loadstart、loadend、load、abort、error、progress、timeout。

文件上传时，对`upload`属性指定`progress`事件的监听函数，即可获得上传的进度。

```js
// <progress min="0" max="100" value="0">0% complete</progress>

function upload(blobOrFile) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/server', true);
  xhr.onload = function (e) {};

  var progressBar = document.querySelector('progress');
  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      progressBar.value = (e.loaded / e.total) * 100;
      // 兼容不支持 <progress> 元素的老式浏览器
      progressBar.textContent = progressBar.value;
    }
  };

  xhr.send(blobOrFile);
}

upload(new Blob(['hello world'], {type: 'text/plain'}));
```

### 实例方法

#### XMLHttpRequest.open()

`XMLHttpRequest.open()`方法用于指定 HTTP 请求的参数，或者说初始化 XMLHttpRequest 实例对象。它一共可以接受五个参数。

```js
void open(
   string method,
   string url,
   optional boolean async,
   optional string user,
   optional string password
);
```

- `method`：表示 HTTP 动词方法，比如`GET`、`POST`、`PUT`、`DELETE`、`HEAD`等。
- `url`: 表示请求发送目标 URL。
- `async`: 布尔值，表示请求是否为异步，默认为`true`。如果设为`false`，则`send()`方法只有等到收到服务器返回了结果，才会进行下一步操作。该参数可选。由于同步 AJAX 请求会造成浏览器失去响应，许多浏览器已经禁止在主线程使用，只允许 Worker 里面使用。所以，这个参数轻易不应该设为`false`。
- `user`：表示用于认证的用户名，默认为空字符串。该参数可选。
- `password`：表示用于认证的密码，默认为空字符串。该参数可选。

注意，如果对使用过`open()`方法的 AJAX 请求，再次使用这个方法，等同于调用`abort()`，即终止请求。

#### XMLHttpRequest.send()

`XMLHttpRequest.send()`方法用于实际发出 HTTP 请求。它的参数是可选的，如果不带参数，就表示 HTTP 请求只有一个 URL，没有数据体，典型例子就是 GET 请求；如果带有参数，就表示除了头信息，还带有包含具体数据的信息体，典型例子就是 POST 请求。

```js
var xhr = new XMLHttpRequest();
var data = 'email='
  + encodeURIComponent(email)
  + '&password='
  + encodeURIComponent(password);

xhr.open('POST', 'http://www.example.com', true);
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.send(data);
```

注意，所有 XMLHttpRequest 的监听事件，都必须在`send()`方法调用之前设定。

`send`方法的参数就是发送的数据。多种格式的数据，都可以作为它的参数。

```js
var formData = new FormData();

formData.append('username', '张三');
formData.append('email', 'zhangsan@example.com');
formData.append('birthDate', 1940);

var xhr = new XMLHttpRequest();
xhr.open('POST', '/register');
xhr.send(formData);
```

`FormData`对象可以用于构造表单数据。它的效果与发送下面的表单数据是一样的。

```html
<form id='registration' name='registration' action='/register'>
  <input type='text' name='username' value='张三'>
  <input type='email' name='email' value='zhangsan@example.com'>
  <input type='number' name='birthDate' value='1940'>
  <input type='submit' onclick='return sendForm(this.form);'>
</form>
```

#### XMLHttpRequest.setRequestHeader()

`XMLHttpRequest.setRequestHeader()`方法用于设置浏览器发送的 HTTP 请求的头信息。

该方法必须在`open()`之后、`send()`之前调用。如果该方法多次调用，设定同一个字段，则每一次调用的值会被合并成一个单一的值发送。

该方法接受两个参数。第一个参数是字符串，表示头信息的字段名，第二个参数是字段值。

```js
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Content-Length', JSON.stringify(data).length);
xhr.send(JSON.stringify(data));
```

上面代码首先设置头信息`Content-Type`，表示发送 JSON 格式的数据；然后设置`Content-Length`，表示数据长度；最后发送 JSON 数据

#### XMLHttpRequest.overrideMimeType()

`XMLHttpRequest.overrideMimeType()`方法用来指定 MIME 类型，覆盖服务器返回的真正的 MIME 类型，从而让浏览器进行不一样的处理。

举例来说，服务器返回的数据类型是`text/xml`，由于种种原因浏览器解析不成功报错，这时就拿不到数据了。为了拿到原始数据，我们可以把 MIME 类型改成`text/plain`，这样浏览器就不会去自动解析，从而我们就可以拿到原始文本了。

```js
xhr.overrideMimeType('text/plain')
```

注意，该方法必须在`send()`方法之前调用。

修改服务器返回的数据类型，不是正常情况下应该采取的方法。如果希望服务器返回指定的数据类型，可以用`responseType`属性告诉服务器，就像下面的例子。只有在服务器无法返回某种数据类型时，才使用`overrideMimeType()`方法。

```js
var xhr = new XMLHttpRequest();
xhr.onload = function(e) {
  var arraybuffer = xhr.response;
  // ...
}
xhr.open('GET', url);
xhr.responseType = 'arraybuffer';
xhr.send();
```

#### XMLHttpRequest.getResponseHeader()

`XMLHttpRequest.getResponseHeader()`方法返回 HTTP 头信息指定字段的值，如果还没有收到服务器回应或者指定字段不存在，返回`null`。该方法的参数不区分大小写。

```js
function getHeaderTime() {
  console.log(this.getResponseHeader("Last-Modified"));
}

var xhr = new XMLHttpRequest();
xhr.open('HEAD', 'yourpage.html');
xhr.onload = getHeaderTime;
xhr.send();
```

如果有多个字段同名，它们的值会被连接为一个字符串，每个字段之间使用“逗号+空格”分隔。

#### XMLHttpRequest.getAllResponseHeaders()

`XMLHttpRequest.getAllResponseHeaders()`方法返回一个字符串，表示服务器发来的所有 HTTP 头信息。

格式为字符串，每个头信息之间使用`CRLF`分隔（回车+换行），如果没有收到服务器回应，该属性为`null`。如果发生网络错误，该属性为空字符串。

```js
xhr.onreadystatechange = function () {
  if (this.readyState === 4) {
    var headers = xhr.getAllResponseHeaders();
  }
}
```

```http
date: Fri, 08 Dec 2017 21:04:30 GMT\r\n
content-encoding: gzip\r\n
x-content-type-options: nosniff\r\n
server: meinheld/0.6.1\r\n
x-frame-options: DENY\r\n
content-type: text/html; charset=utf-8\r\n
connection: keep-alive\r\n
strict-transport-security: max-age=63072000\r\n
vary: Cookie, Accept-Encoding\r\n
content-length: 6502\r\n
x-xss-protection: 1; mode=block\r\n
```

#### XMLHttpRequest.abort()

`XMLHttpRequest.abort()`方法用来终止已经发出的 HTTP 请求。调用这个方法以后，`readyState`属性变为`4`，`status`属性变为`0`。

### 实例事件

#### readyStateChange 事件

`readyState`属性的值发生改变，就会触发 readyStateChange 事件。

我们可以通过`onReadyStateChange`属性，指定这个事件的监听函数，对不同状态进行不同处理。尤其是当状态变为`4`的时候，表示通信成功，这时回调函数就可以处理服务器传送回来的数据。

#### progress 事件

上传文件时，XMLHttpRequest 实例对象本身和实例的`upload`属性，都有一个`progress`事件，会不断返回上传的进度。

```js
var xhr = new XMLHttpRequest();

function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = oEvent.loaded / oEvent.total;
  } else {
    console.log('无法计算进展');
  }
}

xhr.addEventListener('progress', updateProgress);

xhr.open();
```

#### load 事件

#### error 事件

#### abort 事件

load 事件表示服务器传来的数据接收完毕，error 事件表示请求出错，abort 事件表示请求被中断（比如用户取消请求）。

#### loadend 事件

`abort`、`load`和`error`这三个事件，会伴随一个`loadend`事件，表示请求结束，但不知道其是否成功。

```js
xhr.addEventListener('loadend', loadEnd);

function loadEnd(e) {
  console.log('请求结束，状态未知');
}
```

#### timeout 事件

服务器超过指定时间还没有返回结果，就会触发 timeout 事件。

### Navigator.sendBeacon()

用户卸载网页的时候，有时需要向服务器发一些数据。很自然的做法是在`unload`事件或`beforeunload`事件的监听函数里面，使用`XMLHttpRequest`对象发送数据。

但是，这样做不是很可靠，因为`XMLHttpRequest`对象是异步发送，很可能在它即将发送的时候，页面已经卸载了，从而导致发送取消或者发送失败。

解决方法就是`unload`事件里面，加一些很耗时的同步操作。这样就能留出足够的时间，保证异步 AJAX 能够发送成功。

浏览器引入了`Navigator.sendBeacon()`方法。这个方法还是异步发出请求，但是请求与当前页面线程脱钩，作为浏览器进程的任务，因此可以保证会把数据发出去，不拖延卸载流程。

```js
window.addEventListener('unload', logData, false);

function logData() {
  navigator.sendBeacon('/log', JSON.stringify({
    some: "data"
  }));
}
```

`Navigator.sendBeacon()`方法接受两个参数，第一个参数是目标服务器的 URL，第二个参数是所要发送的数据（可选），可以是任意类型（字符串、表单对象、二进制对象等等）。

```js
navigator.sendBeacon(url, data)
```

这个方法的返回值是一个布尔值，成功发送数据为`true`，否则为`false`。

该方法发送数据的 HTTP 方法是 POST，可以跨域，类似于表单提交数据。它不能指定回调函数。

## 同源限制
