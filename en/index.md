---
page: true
title: YuMeng
aside: false
lastUpdated: false
comments: false
---

<script setup>
import Page from "../.vitepress/theme/components/Page.vue";

const posts = [{
    frontMatter: {
        title: "Some things that are temporarily",
        description: "This note is used to temporarily record various contents of the learning process, including learning logs, code snippets, and personal notes, etc., for subsequent reference and summary.",
        date: "2025-05-22",
        category: "Note",
        tags: ["Error", "Chrome", "Tool"]
    },
    regularPath: "/en/posts/study-log"
}]
</script>

<Page :posts="posts" :pageCurrent="1" :pagesNum="1" />