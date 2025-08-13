import { globby } from 'globby'     // globby 是一个用于文件路径匹配的库，可以用于获取指定目录下的所有文件路径
import matter from 'gray-matter'     // gray-matter 是一个用于解析markdown文件的库，可以用于解析markdown文件的frontmatter
import fs from 'fs-extra'            // fs-extra 是一个用于文件操作的库，可以用于读取和写入文件
import { resolve } from 'path'        // resolve 是一个用于解析文件路径的库，可以用于解析文件路径

// 待发布文档的标识
const DRAFT_FLAG = 'draft: true'

// 支持的语言配置
const SUPPORTED_LANGUAGES = {
    root: {
        label: '简体中文',
        lang: 'zh-CN',
        title: '鱼梦江湖',
        postsDir: 'post',
        outputDir: './',
        pageTitle: '鱼梦江湖'
    },
    en: {
        label: 'English',
        lang: 'en-US',
        title: 'YuMeng',
        postsDir: 'en/post',
        outputDir: './en/',
        pageTitle: 'YuMeng'
    },
    ja: {
        label: '日本語',
        lang: 'ja-JP',
        title: '魚の夢',
        postsDir: 'ja/post',
        outputDir: './ja/',
        pageTitle: '魚の夢'
    }
    // 可以继续添加更多语言
    // fr: {
    //     label: 'Français',
    //     lang: 'fr-FR',
    //     title: 'MonBlog',
    //     postsDir: 'fr/posts',
    //     outputDir: './fr/',
    //     pageTitle: 'MonBlog'
    // }
}

async function getPosts(pageSize) {
    const allPosts = {}
    
    // 为每种语言处理文章
    for (const [langKey, langConfig] of Object.entries(SUPPORTED_LANGUAGES)) {
        console.warn('正在处理多语言支持')
        console.log('语言：',langKey)
        console.log('语言配置：',langConfig)
        const posts = await getPostsForLanguage(langKey, langConfig, pageSize)
        allPosts[langKey] = posts
    }
    
    return allPosts
}

async function getPostsForLanguage(langKey, langConfig, pageSize) {
    let paths = await globby([`${langConfig.postsDir}/**.md`])   // 获取对应语言目录下的所有md文件

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
    await generatePaginationPages(validPaths.length, pageSize, langConfig, langKey)

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

    return posts
}

async function generatePaginationPages(total, pageSize, langConfig, langKey) {
    //  pagesNum
    let pagesNum = total % pageSize === 0 ? total / pageSize : Math.floor(total / pageSize) + 1
    const paths = resolve(langConfig.outputDir)
    
    // 确保输出目录存在
    await fs.ensureDir(paths)
    
    if (total > 0) {
        for (let i = 1; i < pagesNum + 1; i++) {
            const page = `
---
page: true
title: ${i === 1 ? langConfig.pageTitle : langConfig.lang === 'zh-CN' ? '第 ' + i + ' 页' : 'Page ' + i}
aside: false
lastUpdated: false
comments: false
---
<script setup>
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.${langConfig.lang === 'zh-CN' ? 'root' : langKey}.slice(${pageSize * (i - 1)},${pageSize * i})
</script>
<Page :posts="posts" :pageCurrent="${i}" :pagesNum="${pagesNum}" />
`.trim()
            const file = paths + `/page_${i}.md`
            await fs.writeFile(file, page)
        }
    }
    
    // 重命名 page_1 为 index 作为首页
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

export { getPosts, SUPPORTED_LANGUAGES } 