---
title: 实用的浏览器脚本
date: 2025-05-18
category: Note
tags: 
    - Chrome
description: 通过在控制台执行脚本，可以实现一些实用的功能，当然也可以嵌入到自己的代码中执行。
outline: [2,3]
---

# 浏览器脚本

## 移除所有事件监听器的脚本

### 方案一

```js
// 克隆节点并替换，这会移除所有事件监听器
function removeAllEventListeners() {
    const body = document.body;
    const newBody = body.cloneNode(true);
    body.parentNode.replaceChild(newBody, body);
    console.log('已移除所有事件监听器');
}
```

### 方案二

```js
function removeAllEventListeners() {
    // 获取所有元素
    const elements = document.getElementsByTagName('*');
    
    // 遍历所有元素
    for (let element of elements) {
        // 获取元素的所有属性
        const attributes = element.attributes;
        
        // 移除所有 on* 属性（如 onclick, onmouseover 等）
        for (let i = attributes.length - 1; i >= 0; i--) {
            const attr = attributes[i];
            if (attr.name.startsWith('on')) {
                element.removeAttribute(attr.name);
            }
        }
        
        // 移除所有事件监听器
        const clone = element.cloneNode(true);
        if (element.parentNode) {
            element.parentNode.replaceChild(clone, element);
        }
    }
    
    // 移除 window 和 document 的事件监听器
    const oldWindow = window;
    const oldDocument = document;
    
    // 重新定义 window 和 document 的事件相关方法
    window.addEventListener = function() {};
    window.removeEventListener = function() {};
    document.addEventListener = function() {};
    document.removeEventListener = function() {};
    
    console.log('已移除所有事件监听器');
}

// 使用方法
removeAllEventListeners();
```

### 方案三 (jQuery)

```js
function removeAllEventListeners() {
    // 移除所有元素的事件监听器
    const elements = document.getElementsByTagName('*');
    
    // 遍历所有元素
    for (let element of elements) {
        // 移除内联事件
        const attributes = element.attributes;
        for (let i = attributes.length - 1; i >= 0; i--) {
            const attr = attributes[i];
            if (attr.name.startsWith('on')) {
                element.removeAttribute(attr.name);
            }
        }
        
        // 移除通过 addEventListener 添加的事件
        const clone = element.cloneNode(true);
        if (element.parentNode) {
            element.parentNode.replaceChild(clone, element);
        }
        
        // 移除 jQuery 事件（如果存在）
        if (window.jQuery) {
            jQuery(element).off();
        }
    }
    
    // 移除 window 和 document 的事件
    const oldWindow = window;
    const oldDocument = document;
    
    // 重新定义事件方法
    window.addEventListener = function() {};
    window.removeEventListener = function() {};
    document.addEventListener = function() {};
    document.removeEventListener = function() {};
    
    // 移除 jQuery 的全局事件（如果存在）
    if (window.jQuery) {
        jQuery(window).off();
        jQuery(document).off();
    }
    
    console.log('已移除所有事件监听器');
}

// 使用方法
removeAllEventListeners();
```


