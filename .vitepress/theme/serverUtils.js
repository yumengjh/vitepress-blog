import { globby } from 'globby'     // globby 是一个用于文件路径匹配的库，可以用于获取指定目录下的所有文件路径
import matter from 'gray-matter'     // gray-matter 是一个用于解析markdown文件的库，可以用于解析markdown文件的frontmatter
import fs from 'fs-extra'            // fs-extra 是一个用于文件操作的库，可以用于读取和写入文件
import { resolve } from 'path'        // resolve 是一个用于解析文件路径的库，可以用于解析文件路径
// import { generateTagColors } from './utils/generateTagColors.js'

// 待发布文档的标识
const DRAFT_FLAG = 'draft: true'

async function getPosts(pageSize) {
    let paths = await globby(['posts/**.md'])   // 获取posts目录下的所有md文件

    // 过滤掉待发布的文档
    let validPaths = []
    for (const path of paths) {
        const content = await fs.readFile(path, 'utf-8')
        const { data } = matter(content)
        
        // 检查是否包含待发布标识
        if (!data.draft) {
            validPaths.push(path)
        } else {
            console.log(`跳过待发布文档: ${path}`)
        }
    }

    //生成分页页面markdown
    await generatePaginationPages(validPaths.length, pageSize)

    let posts = await Promise.all(
        validPaths.map(async (item) => {
            const content = await fs.readFile(item, 'utf-8')
            const { data } = matter(content)
            data.date = _convertDate(data.date)
            return {
                frontMatter: data,
                regularPath: `/${item.replace('.md', '')}`
            }
        })
    )
    posts.sort(_compareDate)

    // 生成标签颜色文件
    // generateTagColors(posts)

    return posts
}

async function generatePaginationPages(total, pageSize) {
    //  pagesNum
    let pagesNum = total % pageSize === 0 ? total / pageSize : Math.floor(total / pageSize) + 1
    const paths = resolve('./')
    if (total > 0) {
        for (let i = 1; i < pagesNum + 1; i++) {
            const page = `
---
page: true
title: ${i === 1 ? '鱼梦江湖' : '第 ' + i + ' 页'}
aside: false
lastUpdated: false
comments: false
---
<script setup>
import Page from "./.vitepress/theme/components/Page.vue";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(${pageSize * (i - 1)},${pageSize * i})
</script>
<Page :posts="posts" :pageCurrent="${i}" :pagesNum="${pagesNum}" />
`.trim()
            const file = paths + `/page_${i}.md`
            await fs.writeFile(file, page)
        }
    }
    // rename page_1 to index for homepage
    await fs.move(paths + '/page_1.md', paths + '/index.md', { overwrite: true })
}

function _convertDate(date = new Date().toString()) {
    const json_date = new Date(date).toJSON()
    return json_date.split('T')[0]
}

function _compareDate(obj1, obj2) {
    // 如果两篇文章都有置顶标记，则按日期降序排序
    if (obj1.frontMatter.sticky && obj2.frontMatter.sticky) {
        return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
    }
    // 如果只有一篇文章有置顶标记，则置顶的文章排在前面
    if (obj1.frontMatter.sticky) {
        return -1
    }
    if (obj2.frontMatter.sticky) {
        return 1
    }
    // 如果都没有置顶标记，则按日期降序排序
    return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
}

export { getPosts } 