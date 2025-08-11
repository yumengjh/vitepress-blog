import DefaultTheme from 'vitepress/theme'
import NewLayout from './components/NewLayout.vue'
import Tags from './components/Tags.vue'
import Page from './components/Page.vue'
import Bookmark from './components/bookmark.vue'

// 代码块折叠
// https://github.com/T-miracle/vitepress-plugin-codeblocks-fold/blob/main/README_zh.md
import codeblocksFold from 'vitepress-plugin-codeblocks-fold'; // 导入方法
import 'vitepress-plugin-codeblocks-fold/style/index.css'; // 导入样式

// 进度条
// import vitepressNprogress from 'vitepress-plugin-nprogress'
// import 'vitepress-plugin-nprogress/lib/css/index.css'

// 时间轴
import "vitepress-markdown-timeline/dist/theme/index.css";

// 指令
// import directives from './utils/directives'

// 自动锚点
import { setupAutoAnchorOnScroll, internationalization } from './functions'
import './custom.css'
import './fonts.css'

// 工具函数导入
import { useRoute, useData } from 'vitepress';
import { onMounted, watch, nextTick, onUnmounted } from 'vue';
import {
    initImages,
    initZoom,
    updateErrorImages,
    initImageTitles
} from './functions';

export default {
    ...DefaultTheme,
    Layout: NewLayout,
    enhanceApp(ctx) {
        // vitepressNprogress(ctx)
        ctx.app.component('Tags', Tags)
        ctx.app.component('Page', Page)
        ctx.app.component('Bookmark', Bookmark)
        // ctx.app.use(directives)
    },
    setup() {
        const route = useRoute();
        const { isDark, frontmatter, theme } = useData();  // 使用 useData 获取主题状态和frontmatter
        let removeAutoAnchor = null;    // 自动锚点解绑函数

        // 初始化代码块折叠功能
        codeblocksFold({ route, frontmatter }, true, 300);

        // 主题切换监听
        watch(isDark, () => {
            // 更新错误图片
            updateErrorImages(isDark.value);
        });

        const initAutoAnchor = () => {
            if (removeAutoAnchor) removeAutoAnchor();
            removeAutoAnchor = setupAutoAnchorOnScroll(frontmatter.value);
        };

        // 出站链接跟踪函数
        const trackOutboundLinks = () => {
            const name = 'outbound-link-click';
            document.querySelectorAll('a').forEach(a => {
                if (a.host !== window.location.host && !a.getAttribute('data-umami-event')) {
                    a.setAttribute('data-umami-event', name);
                    a.setAttribute('data-umami-event-url', a.href);
                }
            });
        };

        // 使用 MutationObserver 监听DOM变化，确保动态加载的内容也能被跟踪
        let observer = null;
        const setupOutboundLinkObserver = () => {
            if (observer) {
                observer.disconnect();
            }
            
            observer = new MutationObserver((mutations) => {
                let shouldTrack = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // 检查是否有新的链接被添加
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.tagName === 'A' || node.querySelectorAll('a').length > 0) {
                                    shouldTrack = true;
                                }
                            }
                        });
                    }
                });
                
                if (shouldTrack) {
                    // 延迟执行以确保所有内容都已渲染
                    setTimeout(() => {
                        trackOutboundLinks();
                    }, 50);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };

        // 组件挂载后执行
        onMounted(() => {
            // 初始化图片处理
            initImages(isDark.value);

            // 初始化图片缩放
            initZoom(frontmatter.value);

            // 初始化图片标题显示
            initImageTitles();

            // 自动锚点
            initAutoAnchor();

            // 国际化
            // internationalization(theme.value.website.SearchText);

            // 确保DOM完全渲染后再执行出站链接跟踪
            nextTick(() => {
                // 使用 setTimeout 确保在下一个事件循环中执行
                setTimeout(() => {
                    // trackOutboundLinks();
                    // 设置DOM变化观察器
                    // setupOutboundLinkObserver();
                }, 100);
            });
        });

        // 路由变化监听
        watch(
            () => route.path,
            () => nextTick(() => {
                // 路由变化时重新初始化图片处理
                initImages(isDark.value);
                initZoom(frontmatter.value);

                // 重新初始化图片标题显示
                initImageTitles();
                initAutoAnchor();
                // internationalization(theme.value.website.SearchText);

                // 路由变化后重新执行出站链接跟踪
                setTimeout(() => {
                    // trackOutboundLinks();
                    // 重新设置DOM变化观察器
                    // setupOutboundLinkObserver();
                }, 100);
            })
        );
        // frontmatter变化监听
        watch(
            () => frontmatter.value,
            () => {
                initAutoAnchor();
            }
        );
        // 离开页面时解绑
        onUnmounted(() => {
            if (removeAutoAnchor) removeAutoAnchor();
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        });
    }
}

