---
title: Algolia 是一个托管型搜索平台，关于它的一些配置，使用与开发中注意事项的详细说明
date: 2025-07-06
category: Note
tags: 
    - Algolia
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
---

::: details 目录
[[toc]]
:::

## 让特定文章不进入搜索范围

在 VitePress 中，可以通过 Frontmatter 元数据标记 结合 Algolia 爬虫规则，实现让特定文章不进入搜索范围。

### 方法 1：通过 Frontmatter 标记 + 爬虫过滤（推荐）

#### 1. 在文章的 Markdown 头部添加 `noindex` 标记

markdown

```yaml
---
title: 我的生活随笔
noindex: true  # 禁止被 Algolia 收录
---
```

因为VitePress不会自动加上 `<meta property="noSearch" content="true">`

```ts
// config.js
export default defineConfig({
  // ...existing code...
  vite: {
    // ...existing code...
  },
  // 自动为 noSearch: true 的页面添加 head
  transformPageData(pageData) {
    if (pageData.frontmatter.noSearch) {
      pageData.frontmatter.head = pageData.frontmatter.head || [];
      pageData.frontmatter.head.push([
        'meta',
        { property: 'noSearch', content: 'true' }
      ]);
    }
  }
});
```

#### 2. 修改 Algolia 爬虫配置

在 Algolia 控制台的 Crawler 配置中，添加 `selectors_exclude` 规则：

```js
actions: [
  {
    indexName: "yumeng",
    recordExtractor: ({ $, helpers }) => {
      // 如果 Frontmatter 包含 noindex: true，跳过该页面
      if ($('meta[property="noSearch"]').length > 0) {
        return [];
      }
      return helpers.docsearch({
        // 原有配置...
      });
    }
  }
]
```

### 方法 2：通过 HTML 元标签（无需修改爬虫）

在 VitePress 的 Frontmatter 中直接生成 `<meta>` 标签：

```yaml
---
head:
  - [meta, { name: "robots", content: "noindex, nofollow" }]
---
```

Algolia 爬虫会自动忽略带有 `noindex` 的页面（这是搜索引擎通用规范）。

### 方法 3：通过文件路径排除

#### 1. 将不想被搜索的文章放在特定目录

例如：

```yaml
docs/
  tech/       # 技术文章
  life/       # 生活随笔（不搜索）
```

#### 2. 修改爬虫配置的 `discoveryPatterns`

```js
discoveryPatterns: [
  "https://yumeng.icu/tech/**",  // 只爬取技术目录
  "!https://yumeng.icu/life/**"  // 排除生活目录
]
```

### 验证是否生效

1. 在 Algolia 控制台的 [Indices](https://dashboard.algolia.com/indices) 中检查记录数量。
2. 尝试搜索被标记的文章标题，确认是否无结果。

### 各方案对比

| 方案             | 优点                 | 缺点                     |
| :--------------- | :------------------- | :----------------------- |
| Frontmatter 标记 | 精准控制单篇文章     | 需调整爬虫配置           |
| HTML 元标签      | 无需改爬虫，通用性强 | 依赖爬虫遵守 robots 规则 |
| 路径排除         | 批量管理方便         | 不够灵活                 |

推荐 **方法1+方法2 组合使用**，双重保障。

## 我的Algolia配置

```js
new Crawler({
  appId: "*************",
  apiKey: "*****************************************",
  maxUrls: 5000,
  indexPrefix: "",
  rateLimit: 8,
  renderJavaScript: false,
  startUrls: ["https://yumeng.icu"],
  discoveryPatterns: ["https://yumeng.icu/**"],
  schedule: "at 14:33 on Monday",
  maxDepth: 10,
  actions: [
    {
      indexName: "yumeng",
      pathsToMatch: ["https://yumeng.icu/**"],
      recordExtractor: ({ $, helpers }) => {
        return helpers.docsearch({
          recordProps: {
            lvl1: ".content h1",
            content: ".content p, .content li",
            lvl0: {
              selectors: "",
              defaultValue: "Documentation",
            },
            lvl2: ".content h2",
            lvl3: ".content h3",
            lvl4: ".content h4",
            lvl5: ".content h5",
          },
          aggregateContent: true,
          recordVersion: "v3",
        });
      },
    },
  ],
  sitemaps: ["https://yumeng.icu/sitemap.xml"],
  initialIndexSettings: {
    yumeng: {
      advancedSyntax: true,
      allowTyposOnNumericTokens: false,
      attributeCriteriaComputedByMinProximity: true,
      attributeForDistinct: "url",
      attributesForFaceting: ["type", "lang"],
      attributesToHighlight: ["hierarchy", "hierarchy_camel", "content"],
      attributesToRetrieve: [
        "hierarchy",
        "content",
        "anchor",
        "url",
        "url_without_anchor",
        "type",
      ],
      attributesToSnippet: ["content:10"],
      camelCaseAttributes: ["hierarchy", "hierarchy_radio", "content"],
      customRanking: [
        "desc(weight.pageRank)",
        "desc(weight.level)",
        "asc(weight.position)",
      ],
      distinct: 1,
      highlightPostTag: "</span>",
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      ignorePlurals: true,
      minProximity: 1,
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      ranking: [
        "words",
        "filters",
        "typo",
        "attribute",
        "proximity",
        "exact",
        "custom",
      ],
      removeWordsIfNoResults: "allOptional",
      searchableAttributes: [
        "unordered(hierarchy_radio_camel.lvl0)",
        "unordered(hierarchy_radio.lvl0)",
        "unordered(hierarchy_radio_camel.lvl1)",
        "unordered(hierarchy_radio.lvl1)",
        "unordered(hierarchy_radio_camel.lvl2)",
        "unordered(hierarchy_radio.lvl2)",
        "unordered(hierarchy_radio_camel.lvl3)",
        "unordered(hierarchy_radio.lvl3)",
        "unordered(hierarchy_radio_camel.lvl4)",
        "unordered(hierarchy_radio.lvl4)",
        "unordered(hierarchy_radio_camel.lvl5)",
        "unordered(hierarchy_radio.lvl5)",
        "unordered(hierarchy_radio_camel.lvl6)",
        "unordered(hierarchy_radio.lvl6)",
        "unordered(hierarchy_camel.lvl0)",
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy_camel.lvl1)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy_camel.lvl2)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy_camel.lvl3)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy_camel.lvl4)",
        "unordered(hierarchy.lvl4)",
        "unordered(hierarchy_camel.lvl5)",
        "unordered(hierarchy.lvl5)",
        "unordered(hierarchy_camel.lvl6)",
        "unordered(hierarchy.lvl6)",
        "content",
      ],
    },
  },
  ignoreCanonicalTo: true,
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
});
```

