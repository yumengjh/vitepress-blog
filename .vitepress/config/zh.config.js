export default {
    label: '简体中文',
    lang: 'zh-CN',
    title: '鱼梦江湖',
    themeConfig: {
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '浅色模式',
        darkModeSwitchTitle: '深色模式',
        returnToTopLabel: '返回顶部',
        footer: {
            message: '如有转载或 CV 的请标注本站原文地址',
            copyright: `版权所有 © 2024-2025 <a style="text-decoration: none !important; font-weight: bold;" href="/pages/about">鱼梦江湖</a>`
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
            // { text: '分类', link: '/pages/categroy' },
            { text: '标签', link: '/pages/tags' },
            // { text: '归档', link: '/pages/archives' },
            { text: '书签', link: '/pages/bookmark' },
            // { text: '聊天', link: 'https://chat.yumeng.icu' },
            // { text: '备忘录', link: 'https://memo.yumeng.icu' },
            // { text: '开发', link: 'https://dev.yumeng.icu' },
            { text: '关于', link: '/pages/about' },
        ],
        lastUpdated: {
            text: '最后更新时间'
        },
        website: {
            author: '鱼梦江湖',
            // copyrightLink: '/pages/about',
            turnPageNextText: '下一页',
            turnPagePrevText: '上一页',
            SearchText: '搜索文章',
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
        },
        search: {
            provider: 'algolia',
            options: {
                appId: process.env.VITE_ALGOLIA_APP_ID || '',
                apiKey: process.env.VITE_ALGOLIA_API_KEY || '',
                indexName: process.env.VITE_ALGOLIA_INDEX_NAME || '',
                askAi: process.env.VITE_ALGOLIA_ASK_AI || '',
                placeholder: '搜索文章',
                translations: {
                    button: {
                        buttonText: '搜索文章',
                        buttonAriaLabel: '搜索'
                    },
                    modal: {
                        searchBox: {
                            clearButtonTitle: '清除查询条件',
                            clearButtonAriaLabel: '清除查询条件',
                            closeButtonText: '关闭',
                            closeButtonAriaLabel: '关闭',
                            placeholderText: '搜索文章',
                            placeholderTextAskAi: '向 AI 提问：',
                            placeholderTextAskAiStreaming: '回答中...',
                            searchInputLabel: '搜索',
                            backToKeywordSearchButtonText: '返回关键字搜索',
                            backToKeywordSearchButtonAriaLabel: '返回关键字搜索'
                        },
                        startScreen: {
                            recentSearchesTitle: '搜索历史',
                            noRecentSearchesText: '没有搜索历史',
                            saveRecentSearchButtonTitle: '保存至搜索历史',
                            removeRecentSearchButtonTitle: '从搜索历史中移除',
                            favoriteSearchesTitle: '收藏',
                            removeFavoriteSearchButtonTitle: '从收藏中移除',
                            recentConversationsTitle: '最近的对话',
                            removeRecentConversationButtonTitle: '从历史记录中删除对话'
                        },
                        errorScreen: {
                            titleText: '无法获取结果',
                            helpText: '你可能需要检查你的网络连接'
                        },
                        noResultsScreen: {
                            noResultsText: '无法找到相关结果',
                            suggestedQueryText: '你可以尝试查询',
                            reportMissingResultsText: '你认为该查询应该有结果？',
                            reportMissingResultsLinkText: '点击反馈'
                        },
                        resultsScreen: {
                            askAiPlaceholder: '向 AI 提问： '
                        },
                        askAiScreen: {
                            disclaimerText: '答案由 AI 生成，可能不准确，请自行验证。',
                            relatedSourcesText: '相关来源',
                            thinkingText: '思考中...',
                            copyButtonText: '复制',
                            copyButtonCopiedText: '已复制！',
                            copyButtonTitle: '复制',
                            likeButtonTitle: '赞',
                            dislikeButtonTitle: '踩',
                            thanksForFeedbackText: '感谢你的反馈！',
                            preToolCallText: '搜索中...',
                            duringToolCallText: '搜索 ',
                            afterToolCallText: '已搜索',
                            aggregatedToolCallText: '已搜索'
                        },
                        footer: {
                            selectText: '选择',
                            submitQuestionText: '提交问题',
                            selectKeyAriaLabel: 'Enter 键',
                            navigateText: '切换',
                            navigateUpKeyAriaLabel: '向上箭头',
                            navigateDownKeyAriaLabel: '向下箭头',
                            closeText: '关闭',
                            backToSearchText: '返回搜索',
                            closeKeyAriaLabel: 'Esc 键',
                            poweredByText: '搜索提供者'
                        }
                    }
                }
            }
        }
    }
}