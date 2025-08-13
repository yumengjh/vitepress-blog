export default {
    label: '日本語',
    lang: 'ja-JP',
    title: '魚の夢',
    themeConfig: {
        footer: {
            message: '再版がある場合は、このサイトにマークを付けてください',
            copyright: `Copyright © 2024-2025 <a style="text-decoration: none !important; font-weight: bold;" href="/ja/pages/about">魚の夢</a>
            <br>
            プラットフォームの展開：
            <a href="https://yumeng.icu/ja" target="_blank">Netlify</a> |
            <a href="https://blog.yumeng.icu/ja" target="_blank">Vercel</a> |    
            <a href="https://www.yumeng.icu/ja" target="_blank">Server</a>
            `
        },
        notFound: {
            code: 404,
            title: 'ページが見つかりません',
            quote: "方向を変えない場合、見続けると、あなたが向かっているところに到達するかもしれません。",
            linkText: 'ホームに戻る',
        },
        outline: {
            label: '目次',
            level: [2, 3]
        },
        nav: [
            { text: 'ホーム', link: '/ja/' },
            // { text: 'カテゴリ', link: '/ja/pages/categroy' },
            { text: 'ブックマーク', link: '/ja/pages/tags' },
            // { text: 'Bookmarks', link: '/en/pages/bookmark' },
            // { text: 'Chat', link: 'https://chat.yumeng.icu' },
            // { text: 'Memo', link: 'https://memo.yumeng.icu' },
            // { text: 'Dev', link: 'https://dev.yumeng.icu' },
            { text: '私について', link: '/ja/pages/about' },
        ],
        website: {
            author: '魚の夢',
            turnPageNextText: '次へ',
            turnPagePrevText: '前へ',
            SearchText: '検索',
            // copyrightLink: 'en/pages/about',
            showPrevNextBtn: true,
            updateText: '更新',
            RelativeTimeText: {
                now: ' たった今',
                minute: ' 分',
                hour: ' 時間',
                day: ' 日'
            },
            UpdateTextsuffix: {
                front: ' 前',
                back: ' 後'
            },
        },
        lastUpdated: {
            text: '最終更新'
        },
        search: {
            provider: 'algolia',
            options: {
                appId: process.env.VITE_ALGOLIA_APP_ID || '',
                apiKey: process.env.VITE_ALGOLIA_API_KEY || '',
                indexName: process.env.VITE_ALGOLIA_INDEX_NAME || '',
                placeholder: '記事を検索',
                translations: {
                    button: {
                        buttonText: '検索',
                        buttonAriaLabel: '検索'
                    },
                    modal: {
                        searchBox: {
                            resetButtonTitle: 'クエリをクリア',
                            resetButtonAriaLabel: 'クエリをクリア',
                            cancelButtonText: 'キャンセル',
                            cancelButtonAriaLabel: 'キャンセル'
                        },
                        startScreen: {
                            recentSearchesTitle: '最近',
                            noRecentSearchesText: '最近の検索がありません',
                            saveRecentSearchButtonTitle: '最近に保存',
                            removeRecentSearchButtonTitle: '最近から削除'
                        },
                        errorScreen: {
                            titleText: '結果を取得できません',
                            helpText: 'ネットワーク接続を確認してください'
                        },
                        footer: {
                            selectText: '選択',
                            navigateText: 'ナビゲート',
                            closeText: '閉じる',
                            searchByText: '検索'
                        },
                        noResultsScreen: {
                            noResultsText: '結果がありません',
                            suggestedQueryText: '試してください',
                            reportMissingResultsText: 'このクエリが結果を返すべきですか？',
                            reportMissingResultsLinkText: 'お知らせください'
                        }
                    }
                }
            }
        }
    }
}