import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'
import timeline from "vitepress-markdown-timeline";
import { RssPlugin } from 'vitepress-plugin-rss'
import { fileURLToPath } from 'url'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
//每页的文章数量
const pageSize = 10

// RSS 配置
const baseUrl = 'https://yumeng.icu'
const RSS = {
    title: 'YuMeng',
    baseUrl,
    copyright: 'Copyright (c) 2025-present, YuMeng',
    filename: 'feed.xml',
    description: '鱼梦江湖的个人博客，记录生活，分享技术。',
    language: 'zh-CN',
    pubDate: new Date(),
    lastUpdated: new Date(),
    outDir: '.vitepress/dist',
    includes: ['posts/*.md'],
    excludes: ['pages/*'],
    count: 20
}

export default defineConfig({
    lang: 'zh-CN',
    title: 'YuMeng',
    titleTemplate: ":title",
    base: '/',
    cacheDir: './node_modules/vitepress_cache',
    description: '鱼梦江湖的个人博客，记录生活，分享技术。',
    ignoreDeadLinks: true,
    lastUpdated: true,
    cleanUrls: true,
    rewrites: {
        // 'posts/:name': ':name',
        // 'pages/:page': ':page',
    },
    markdown: {
        theme: {
            light: 'vitesse-light',      // 浅色模式用的主题
            dark: 'vitesse-dark'        // 深色模式用的主题
        },
        // lineNumbers: true,
        config: (md) => {
            // use more markdown-it plugins!
            // md.use(mdItCustomAttrs, 'image', {
            //     'data-fancybox': "gallery"
            // })
            md.use(timeline);
        },
        image: {
            lazyLoading: true,
        },
        anchor: {
            slugify: (str) => str.replace(/\s+/g, '-').toLowerCase()
        },
    },
    head: [
        ["link", { rel: "alternate", type: "application/rss+xml", title: "RSS Feed", href: "/feed.xml" }],  // 使浏览器能够自动发现 RSS 源
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['meta', { name: 'author', content: 'YuMeng' }],
        ['meta', { name: 'keywords', content: '博客,前端,JavaScript' }],
    ],
    themeConfig: {
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '浅色模式',
        darkModeSwitchTitle: '深色模式',
        returnToTopLabel: '返回顶部',
        notFound: {
            code: 404,
            title: '页面不存在',
            quote: '迷路了吗？让我们回到首页吧',
            linkText: '返回首页',
        },
        externalLinkIcon: false,
        lastUpdated: {
            text: '最后更新时间',
            formatOptions: {
                dateStyle: 'short', // full, long, medium, short
                timeStyle: 'medium'
            }
        },
        posts: await getPosts(pageSize),
        nav: [
            { text: '首页', link: '/' },
            { text: '标签', link: '/pages/tags' },
            { text: '工具', link: '/pages/site' },
            // {
            //     text: '回顾', items: [
            //         { text: '2024', link: '/pages/review/2024' },
            //         { text: '2023', link: '/pages/review/2023' },
            //     ]
            // },
            { text: '关于我', link: '/pages/about' },
        ],
        // footer: {
        //     message: 'Released under the MIT License',
        //     copyright: 'Copyright © 2024-present <a style="text-decoration: none !important;" href="/pages/about">YuMeng</a>'
        // },
        outline: {
            label: '本页目录',
            level: [2, 3]
        },
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/yumengjh'
            },
        ],
        website: {
            copyrightLink: '/pages/about',
            showPrevNextBtn: true,     // 上一頁/下一页按钮是否显示
        }
    },
    srcExclude: ['README.md'], // 排除README.md文件，不需要编译

    vite: {
        server: { port: 5000 },
        plugins: [
            // RssPlugin(RSS),
            pagefindPlugin({
                showDate: true,
                pageResultCount: 4,
            })
        ],
        optimizeDeps: {
            exclude: [
                'vitepress-plugin-rss'
            ]
        },
        ssr: {
            noExternal: [
                'vitepress-plugin-rss'
            ]
        },
        resolve: {
            alias: [
                {
                    find: /^.*\/VPSwitchAppearance\.vue$/,
                    replacement: fileURLToPath(
                        new URL('./theme/components/CustomSwitchAppearance.vue', import.meta.url)
                    )
                }
            ]
        },
    }
}) 