import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'
import timeline from "vitepress-markdown-timeline";
import { RssPlugin } from 'vitepress-plugin-rss'
import { fileURLToPath } from 'url'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
//每页的文章数量
const pageSize = 15

// RSS 配置
const baseUrl = 'https://blog.yumeng.icu'
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
    cleanUrls: false,
    rewrites: {
        // 'posts/:name': ':name',
        // 'pages/:page': ':page',
    },
    markdown: {
        // theme: {
        //     light: 'vitesse-light',      // 浅色模式用的主题
        //     dark: 'vitesse-dark'        // 深色模式用的主题
        // },
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
        ['link', { rel: 'icon', href: 'https://api.iconify.design/game-icons:fish-escape.svg' }],
        ['meta', { name: 'author', content: 'YuMeng' }],
        ['meta', { name: 'keywords', content: '博客,前端,JavaScript' }],
    ],
    locales: {
        root: {
            label: '简体中文',
            lang: 'zh-CN',
            title: '鱼梦江湖',
            themeConfig: {
                darkModeSwitchLabel: '主题',
                lightModeSwitchTitle: '浅色模式',
                darkModeSwitchTitle: '深色模式',
                returnToTopLabel: '返回顶部',
                footer: {
                    message: '基于 MIT 许可发布',
                    copyright: '版权所有 © 2024-2025 <a style="text-decoration: none !important;" href="/pages/about">鱼梦江湖</a>'
                },
                notFound: {
                    code: 404,
                    title: '页面不存在',
                    quote: '但是，如果你不改变方向，如果你继续寻找，你最终可能会到达你要去的地方。',
                    linkText: '返回首页',
                },
                outline: {
                    label: '文章摘要',
                    level: [2, 3]
                },
                nav: [
                    { text: '首页', link: '/' },
                    { text: '标签', link: '/pages/tags' },
                    { text: '书签', link: '/pages/site' },
                    { text: '关于', link: '/pages/about' },
                ],
                lastUpdated: {
                    text: '最后更新时间'
                },
                website: {
                    // copyrightLink: '/pages/about',
                    showPrevNextBtn: true,
                    updateText: '更新',
                    UpdateTextsuffix: {
                        front: '前',
                        back: '后'
                    },
                    RelativeTimeText: {
                        now: '刚刚',
                        minute: '分钟',
                        hour: '小时',
                        day: '天'
                    }
                }
            }
        },
        en: {
            label: 'English',
            lang: 'en-US',
            title: 'YuMeng',
            themeConfig: {
                footer: {
                    message: 'Released under the MIT License',
                    copyright: 'Copyright © 2024-2025 <a style="text-decoration: none !important;" href="/pages/about">YuMeng</a>'
                },
                notFound: {
                    code: 404,
                    title: 'PAGE NOT FOUND',
                    quote: "But if you don't change your direction, and if you keep looking, you may end up where you are heading.",
                    linkText: 'Take me home',
                },
                outline: {
                    label: 'Table of Contents',
                    level: [2, 3]
                },
                nav: [
                    { text: 'Home', link: '/en/' },
                    { text: 'Tags', link: '/en/pages/tags' },
                    { text: 'Bookmarks', link: '/en/pages/site' },
                    { text: 'About', link: '/en/pages/about' },
                ],
                website: {
                    // copyrightLink: 'en/pages/about',
                    showPrevNextBtn: false,
                    updateText: 'Update',
                    RelativeTimeText: {
                        now: ' Just now',
                        minute: ' Minute',
                        hour: ' Hour',
                        day: ' Day'
                    },
                    UpdateTextsuffix: {
                        front: ' Before',
                        back: ' After'
                    },
                },
                lastUpdated: {
                    text: 'Last updated'
                }
            }
        }
    },
    themeConfig: {
        logo: {
            light: 'https://api.iconify.design/game-icons:fish-escape.svg?color=black',
            dark: 'https://api.iconify.design/game-icons:fish-escape.svg?color=white'
        },
        externalLinkIcon: false,
        lastUpdated: {
            formatOptions: {
                dateStyle: 'short', // full, long, medium, short
                timeStyle: 'medium'
            }
        },
        posts: await getPosts(pageSize),
        socialLinks: [
            {
                icon: {
                    svg: '<svg t="1747910880954" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1607" id="mx_n_1747910880955" width="200" height="200"><path d="M682.215454 981.446137c-25.532318 0-42.553863-17.021545-42.553864-42.553864v-165.960067c4.255386-34.043091-8.510773-59.575409-29.787704-80.852341-12.766159-12.766159-17.021545-29.787704-8.510773-42.553864 4.255386-17.021545 21.276932-25.532318 34.043091-29.787704 123.406204-12.766159 238.301635-55.320023 238.301635-255.323181 0-46.80925-17.021545-93.6185-51.064636-131.916976-12.766159-12.766159-12.766159-29.787704-8.510772-42.553864 12.766159-34.043091 12.766159-68.086182 4.255386-102.129272-21.276932 4.255386-55.320023 17.021545-110.640045 55.320022-8.510773 8.510773-21.276932 8.510773-34.043091 4.255387-89.363113-25.532318-187.236999-25.532318-276.600112 0-12.766159 4.255386-25.532318 4.255386-38.298477-4.255387C307.741455 104.836549 269.442978 92.07039 248.166047 87.815004c-8.510773 34.043091-8.510773 68.086182 4.255386 102.129272 4.255386 17.021545 4.255386 34.043091-8.510773 42.553864-34.043091 38.298477-51.064636 85.107727-51.064636 131.916976 0 200.003158 114.895431 242.557022 238.301635 255.323181 17.021545 0 29.787704 12.766159 34.043091 29.787704 4.255386 17.021545 0 34.043091-8.510773 42.553864-21.276932 21.276932-29.787704 46.80925-29.787704 76.596954v165.960068c0 25.532318-17.021545 42.553863-42.553863 42.553863s-42.553863-17.021545-42.553864-42.553863v-72.341568c-127.66159 21.276932-182.981613-51.064636-221.28009-97.873886-17.021545-21.276932-29.787704-38.298477-46.80925-42.553864-21.276932-4.255386-38.298477-29.787704-29.787704-51.064636 4.255386-21.276932 29.787704-38.298477 51.064636-29.787704 42.553863 12.766159 68.086182 42.553863 93.6185 72.341568 34.043091 46.80925 63.830795 80.852341 153.193908 63.830795v-4.255386c0-25.532318 4.255386-55.320023 12.766159-76.596955-119.150818-25.532318-246.812408-102.129272-246.812408-327.664748 0-63.830795 21.276932-123.406204 59.575409-170.215454-17.021545-59.575409-12.766159-114.895431 12.766159-170.215454 4.255386-12.766159 12.766159-21.276932 25.532318-25.532318 17.021545-4.255386 72.341568-12.766159 187.236999 59.575409 93.6185-21.276932 191.492386-21.276932 280.855499 0 110.640045-72.341568 170.215454-63.830795 187.236999-59.575409 12.766159 4.255386 21.276932 12.766159 25.532319 25.532318 21.276932 55.320023 25.532318 110.640045 12.766159 165.960067 38.298477 46.80925 59.575409 106.384659 59.575408 170.215454 0 242.557022-144.683136 306.387817-246.812408 331.920135 8.510773 25.532318 12.766159 55.320023 12.766159 80.852341V938.892273c0 25.532318-17.021545 42.553863-42.553863 42.553864z" p-id="1608"></path></svg>'
                },
                link: 'https://github.com/yumengjh'
            },
        ],
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