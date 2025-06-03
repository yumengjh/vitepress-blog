---
title: JavaScript中的ArrayBuffer
date: 2025-06-03
category: Note
tags: 
    - JavaScript
description: ArrayBuffer是JavaScript中用于表示原始二进制数据缓冲区的低级对象。
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

# 电脑存储单位详解

- **最小单位**：位（bit，缩写为 b）
- **最大常用单位**：目前是尧字节（Yottabyte，YB），但实际应用中常见最大单位是**TB**或PB

## 存储单位换算表

| 单位名称 | 英文简称 | 换算关系           | 以字节为基准 |
| -------- | -------- | ------------------ | ------------ |
| 位       | bit (b)  | 1 bit = 0.125 字节 | 1/8 字节     |
| 字节     | Byte (B) | 1 Byte = 8 bits    | 1 字节       |
| 千字节   | KB       | 1 KB = 1024 Bytes  | 2¹⁰ 字节     |
| 兆字节   | MB       | 1 MB = 1024 KB     | 2²⁰ 字节     |
| 吉字节   | GB       | 1 GB = 1024 MB     | 2³⁰ 字节     |
| 太字节   | TB       | 1 TB = 1024 GB     | 2⁴⁰ 字节     |
| 拍字节   | PB       | 1 PB = 1024 TB     | 2⁵⁰ 字节     |
| 艾字节   | EB       | 1 EB = 1024 PB     | 2⁶⁰ 字节     |
| 泽字节   | ZB       | 1 ZB = 1024 EB     | 2⁷⁰ 字节     |
| 尧字节   | YB       | 1 YB = 1024 ZB     | 2⁸⁰ 字节     |

## 快速换算指南

1. **相邻单位换算**：乘以或除以1024

   - 1 GB = 1024 MB
   - 1 MB = 1024 KB
   - 以此类推

2. **非相邻单位换算**：使用2的幂次方

   - 1 GB = 1024³ B = 1,073,741,824 字节
   - 1 TB = 1024⁴ B = 1,099,511,627,776 字节

3. **位与字节换算**：

   - 1 Byte = 8 bits
   - 1 KB = 8192 bits (1024×8)


# ArrayBuffer

`ArrayBuffer` 是 JavaScript 中用于表示**原始二进制数据缓冲区**的低级对象。它是处理二进制数据的基础，常用于文件操作、网络通信、图像处理等场景。

`ArrayBuffer`对象、`TypedArray`视图和`DataView`视图是 JavaScript 操作二进制数据的一个接口。

它们都是以数组的语法处理二进制数据，所以统称为二进制数组。

这个接口的原始设计目的，与 WebGL 项目有关。所谓 WebGL，就是指浏览器与显卡之间的通信接口，为了满足 JavaScript 与显卡之间大量的、实时的数据交换，它们之间的数据通信必须是二进制的，而不能是传统的文本格式。

文本格式传递一个 32 位整数，两端的 JavaScript 脚本与显卡都要进行格式转化，将非常耗时。这时要是存在一种机制，可以像 C 语言那样，**直接操作字节**，将 4 个字节的 32 位整数，以二进制形式原封不动地送入显卡，脚本的性能就会大幅提升。

二进制数组就是在这种背景下诞生的。它很像 C 语言的数组，**允许开发者以数组下标的形式，直接操作内存**，大大增强了 JavaScript 处理二进制数据的能力，使得开发者有可能通过 JavaScript 与操作系统的原生接口进行二进制通信。

二进制数组由三类对象组成：

**（1）`ArrayBuffer`对象**：代表内存之中的一段二进制数据，可以通过“视图”进行操作。“视图”部署了数组接口，这意味着，可以用数组的方法操作内存。

**（2）`TypedArray`视图**：共包括 9 种类型的视图，比如`Uint8Array`（无符号 8 位整数）数组视图, `Int16Array`（16 位整数）数组视图, `Float32Array`（32 位浮点数）数组视图等等。

**（3）`DataView`视图**：可以自定义复合格式的视图，比如第一个字节是 Uint8（无符号 8 位整数）、第二、三个字节是 Int16（16 位整数）、第四个字节开始是 Float32（32 位浮点数）等等，此外还可以自定义字节序。

简单说，`ArrayBuffer`对象代表原始的二进制数据，`TypedArray`视图用来读写简单类型的二进制数据，`DataView`视图用来读写复杂类型的二进制数据。

`TypedArray`视图支持的数据类型一共有 9 种（`DataView`视图支持除`Uint8C`以外的其他 8 种）。

| 数据类型 | 字节长度 | 含义                             | 对应的 C 语言类型 |
| -------- | -------- | -------------------------------- | ----------------- |
| Int8     | 1        | 8 位带符号整数                   | signed char       |
| Uint8    | 1        | 8 位不带符号整数                 | unsigned char     |
| Uint8C   | 1        | 8 位不带符号整数（自动过滤溢出） | unsigned char     |
| Int16    | 2        | 16 位带符号整数                  | short             |
| Uint16   | 2        | 16 位不带符号整数                | unsigned short    |
| Int32    | 4        | 32 位带符号整数                  | int               |
| Uint32   | 4        | 32 位不带符号的整数              | unsigned int      |
| Float32  | 4        | 32 位浮点数                      | float             |
| Float64  | 8        | 64 位浮点数                      | double            |

**注意**，二进制数组并不是真正的数组，而是类似数组的对象。

很多浏览器操作的 API，用到了二进制数组操作二进制数据，下面是其中的几个。

- [Canvas](#canvas)
- [Fetch API](#fetch-api)
- [File API](#file-api)
- [WebSockets](#websocket)
- [XMLHttpRequest](#ajax)

## ArrayBuffer 对象

### 概述

`ArrayBuffer`对象代表储存二进制数据的一段内存，它不能直接读写，只能通过视图（`TypedArray`视图和`DataView`视图)来读写，视图的作用是以指定格式解读二进制数据。

`ArrayBuffer`也是一个构造函数，可以分配一段可以存放数据的连续内存区域。

```JS
const buf = new ArrayBuffer(32);
```

上面代码生成了一段 32 字节的内存区域，每个字节的值默认都是 0。可以看到，`ArrayBuffer`构造函数的参数是所需要的内存大小（单位字节）。

为了读写这段内容，需要为它指定视图。`DataView`视图的创建，需要提供`ArrayBuffer`对象实例作为参数。

```js
const buf = new ArrayBuffer(32);
const dataView = new DataView(buf);
dataView.getUint8(0) // 0
```

上面代码对一段 32 字节的内存，建立`DataView`视图，然后以不带符号的 8 位整数格式，从头读取 8 位二进制数据，结果得到 0，因为原始内存的`ArrayBuffer`对象，默认所有位都是 0。

另一种`TypedArray`视图，与`DataView`视图的一个区别是，它不是一个构造函数，而是一组构造函数，代表不同的数据格式。

```js
const buffer = new ArrayBuffer(12);

const x1 = new Int32Array(buffer);
x1[0] = 1;
const x2 = new Uint8Array(buffer);
x2[0]  = 2;

x1[0] // 2
```

上面代码对同一段内存，分别建立两种视图：32 位带符号整数（`Int32Array`构造函数）和 8 位不带符号整数（`Uint8Array`构造函数）。**由于两个视图对应的是同一段内存，一个视图修改底层内存，会影响到另一个视图。**

`TypedArray`视图的构造函数，除了接受`ArrayBuffer`实例作为参数，**还可以接受普通数组作为参数，直接分配内存生成底层的`ArrayBuffer`实例，并同时完成对这段内存的赋值。**

```js
const typedArray = new Uint8Array([0,1,2]);
typedArray.length // 3

typedArray[0] = 5;
typedArray // [5, 1, 2]
```

上面代码使用`TypedArray`视图的`Uint8Array`构造函数，新建一个不带符号的 8 位整数视图。可以看到，`Uint8Array`直接使用普通数组作为参数，对底层内存的赋值同时完成。

### ArrayBuffer.prototype.byteLength

`ArrayBuffer`实例的`byteLength`属性，返回所分配的内存区域的字节长度。

```js
const buffer = new ArrayBuffer(32);
buffer.byteLength
// 32
```

如果要分配的内存区域很大，有可能分配失败（因为没有那么多的连续空余内存），所以有必要检查是否分配成功。

```js
if (buffer.byteLength === n) {
  // 成功
} else {
  // 失败
}
```

### ArrayBuffer.prototype.slice()

`ArrayBuffer`实例有一个`slice`方法，允许将内存区域的一部分，拷贝生成一个新的`ArrayBuffer`对象。

```js
const buffer = new ArrayBuffer(8);
const newBuffer = buffer.slice(0, 3);
```

上面代码拷贝`buffer`对象的前 3 个字节（从 0 开始，到第 3 个字节前面结束），生成一个新的`ArrayBuffer`对象。`slice`方法其实包含两步，第一步是先分配一段新内存，第二步是将原来那个`ArrayBuffer`对象拷贝过去。

`slice`方法接受两个参数，第一个参数表示拷贝开始的字节序号（含该字节），第二个参数表示拷贝截止的字节序号（不含该字节）。如果省略第二个参数，则默认到原`ArrayBuffer`对象的结尾。

除了`slice`方法，`ArrayBuffer`对象不提供任何直接读写内存的方法，只允许在其上方建立视图，然后通过视图读写。

### ArrayBuffer.isView()

