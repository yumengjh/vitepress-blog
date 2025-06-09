---
title: 更新历史
---

# 更新历史

---
::: timeline 2025-05-10
- **自动锚点**
- 添加自动锚点功能
- 通过 `AutoAnchor: true` 在 frontmatter 中设置文章为自动锚点
:::

::: timeline 2025-04-29
- **全新主页样式**
- **标签颜色**
- 添加标签颜色功能
- 通过 `generateTagColors` 函数生成标签颜色
- 通过 `tagMap` 函数生成标签映射
- 通过 `getTagStyle` 函数获取标签样式
- **文章状态**
- 添加文章状态功能
- 通过 `draft: true` 在 frontmatter 中设置文章为草稿（不渲染到页面）
- 通过 `done: true` 在 frontmatter 中设置文章为完成（渲染到页面，但标识为未完成，图标为黄色）
- 通过 `sticky: true` 在 frontmatter 中设置文章为置顶（渲染到页面，但标识为置顶，图标为蓝色）
- 通过 `gridPaper: true` 在 frontmatter 中设置文章为格子纸背景
- 通过 `cbf: false` 在 frontmatter 中设置文章为代码块不折叠（默认折叠）
:::

::: timeline 2025-04-28
- **图片标题**
- 添加图片标题功能
```md
![图片描述](图片路径){title="图片标题"}
```
:::

::: timeline 2025-04-26
- ~~**自定义指令v-slide-up**~~
- 参数：
  - delay: 延迟时间(ms)
  - duration: 动画持续时间(ms)
  - distance: 移动距离
  - once: 是否只执行一次
  - threshold: 触发阈值(0-1)
- 使用：
```vue
<div v-slide-up="{ delay: 100, duration: 1000, distance: '30px', once: true, threshold: 0.2 }">
  内容
</div>
```
:::

::: timeline 2025-04-23
- **图片缩放**
- 添加图片缩放功能
- 在 Markdown 文件的 frontmatter 中添加 `zoomable: false` 即可禁用当前文档所有图片缩放功能
- 单个图片使用`![alt](path/to/file.jpg){no-zoom}`即可禁用图片**样式**和**缩放**功能
- 单个图片使用`![alt](path/to/file.jpg){no-style}`即可禁用图片**样式**但是保留**缩放**功能
:::

::: timeline 2025-04-21
- **跳页按钮**
- 添加跳页按钮
:::

::: timeline 2025-04-20
- **格子纸背景**
- 添加格子纸背景效果
- 在 Markdown 文件的 frontmatter 中添加 `gridPaper: true` 即可启用格子纸背景效果
- 适用于笔记页面，手绘效果页面，学术或教育内容，创意设计展示，个人日记风格的博客

调整格子纸的样式，可以修改 `.vitepress/theme/custom.css` 文件中的以下部分：

```css
.grid-paper-bg {
    background-image: 
        linear-gradient(rgba(var(--grid-color-rgb), 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(var(--grid-color-rgb), 0.15) 1px, transparent 1px);
    background-size: 20px 20px;
    background-position: -1px -1px;
}
```

你可以调整以下参数：
- 网格线颜色透明度：`rgba(var(--grid-color-rgb), 0.15)` 中的 0.15
- 网格大小：`background-size: 20px 20px`

::: tip
格子纸背景会根据当前主题自动调整颜色，在浅色模式下使用深色网格线，在深色模式下使用浅色网格线。
:::


::: timeline 2025-04-19
- ~~**彩带效果**~~
- 添加彩带效果
- 当阅读到文章底部时，会触发彩带效果
:::

::: timeline 2025-04-18
- **RSS**
- 添加 RSS 功能支持
- 通过 `publish: false` 可以在 frontmatter 中设置文章不出现在 RSS 中
:::

::: timeline 2025-04-17
- **时间轴**
- 添加 vitepress-markdown-timeline 插件支持
- 支持 Markdown 时间轴语法
:::

::: timeline 2025-04-16
- **进度条**
- 添加 vitepress-plugin-nprogress 插件
- 页面跳转时显示顶部进度条
:::

::: timeline 2025-04-15
- **代码块折叠**
- 支持通过 frontmatter 中的 `cbf` 控制代码块折叠 （cbf: [1,2,3]当前页面的第1、2、3个代码块不开启折叠，true/false表示当前页面的所有代码块是否开启折叠）
- **氛围组**
- 添加氛围组组件
:::

::: timeline 2025-04-14
- **图片自动切换源**(已废弃,但保留代码)
- 优化图片加载体验
:::

::: timeline 2025-04-13
- **添加自动生成新文章脚本**
- ~~添加重写路由~~（已废弃：外部访问时无法找到具体路径）
:::

::: timeline 2025-04-12
- **添加置顶功能**
- **全局图片错误处理**
- **自定义404页面**
:::

::: timeline 2025-04-11
- **增强标签选中交互**
- 优化标签选择的用户体验
:::

::: timeline 2025-04-07
- **美化URL地址**
- 添加 `cleanUrls: true` 配置
- 生成的 HTML 页面不带有 .html 后缀
:::