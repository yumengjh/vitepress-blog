export default {
    label: 'English',
    lang: 'en-US',
    title: 'YuMeng',
    themeConfig: {
        footer: {
            message: 'If there is a reprint, please mark this site',
            copyright: `Copyright © 2024-2025 <a style="text-decoration: none !important; font-weight: bold;" href="/en/pages/about">YuMeng</a>
            <br>
            Deploy Platform:
            <a href="https://yumeng.icu/en" target="_blank">Netlify</a> |
            <a href="https://blog.yumeng.icu/en" target="_blank">Vercel</a> |    
            <a href="https://www.yumeng.icu/en" target="_blank">Server</a>
            `
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
            // { text: 'Category', link: '/en/pages/categroy' },
            { text: 'Tags', link: '/en/pages/tags' },
            // { text: 'Bookmarks', link: '/en/pages/bookmark' },
            // { text: 'Chat', link: 'https://chat.yumeng.icu' },
            // { text: 'Memo', link: 'https://memo.yumeng.icu' },
            // { text: 'Dev', link: 'https://dev.yumeng.icu' },
            { text: 'About', link: '/en/pages/about' },
        ],
        website: {
            author: 'YuMeng',
            turnPageNextText: 'Next',
            turnPagePrevText: 'Previous',
            SearchText: 'Search',
            // copyrightLink: 'en/pages/about',
            showPrevNextBtn: true,
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
        },
        search: {
            provider: 'algolia',
            options: {
                appId: process.env.VITE_ALGOLIA_APP_ID || '',
                apiKey: process.env.VITE_ALGOLIA_API_KEY || '',
                indexName: process.env.VITE_ALGOLIA_INDEX_NAME || '',
                placeholder: 'Search article',
                translations: {
                    button: {
                        buttonText: 'Search',
                        buttonAriaLabel: 'Search'
                    },
                    modal: {
                        searchBox: {
                            resetButtonTitle: 'Clear query',
                            resetButtonAriaLabel: 'Clear query',
                            cancelButtonText: 'Cancel',
                            cancelButtonAriaLabel: 'Cancel'
                        },
                        startScreen: {
                            recentSearchesTitle: 'Recent',
                            noRecentSearchesText: 'No recent searches',
                            saveRecentSearchButtonTitle: 'Save to recent',
                            removeRecentSearchButtonTitle: 'Remove from recent'
                        },
                        errorScreen: {
                            titleText: 'Unable to fetch results',
                            helpText: 'You might want to check your network connection'
                        },
                        footer: {
                            selectText: 'Select',
                            navigateText: 'Navigate',
                            closeText: 'Close',
                            searchByText: 'Search by'
                        },
                        noResultsScreen: {
                            noResultsText: 'No results for',
                            suggestedQueryText: 'You can try',
                            reportMissingResultsText: 'Think this query should return results?',
                            reportMissingResultsLinkText: 'Let us know'
                        }
                    }
                }
            }
        }
    }
}