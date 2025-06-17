---
title: Node.js入门笔记
date: 2025-06-15
category: Note
tags: 
    - Node.js
description: Node.js入门笔记
outline: [2,3]
draft: true
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
---

# Node 入门

原文地址：https://www.nodebeginner.org/index-zh-cn.html

```js
var http = require("http");

http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
}).listen(8888);
```

http 是 node 自带的模块，调用模块上的 createServer 函数，返回一个对象，这个对象上有一个 listen 方法，传入一个数值参数，指定这个服务器监听的端口。



