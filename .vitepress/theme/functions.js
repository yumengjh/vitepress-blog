

// 导入模块
import mediumZoom from 'medium-zoom';

// 初始化标签
export function initTags(posts) {
    const data = {}
    posts.forEach((post) => {
        post.frontMatter.tags?.forEach((tag) => {
            data[tag] = data[tag] || []
            data[tag].push(post)
        })
    })
    // 按标签数量降序排序
    return Object.fromEntries(Object.entries(data).sort(([, posts1], [, posts2]) => posts2.length - posts1.length))
}

// 初始化分类
export function initCategory(posts) {
    const data = {}
    for (let index = 0; index < posts.length; index++) {
        const element = posts[index]
        const category = element.frontMatter.category
        if (category) {
            if (data[category]) {
                data[category].push(element)
            } else {
                data[category] = []
                data[category].push(element)
            }
        }
    }
    return data
}

// 年份排序
export function useYearSort(post) {
    const data = []
    let year = '0'
    let num = -1
    for (let index = 0; index < post.length; index++) {
        const element = post[index]
        if (element.frontMatter.date) {
            const y = element.frontMatter.date.split('-')[0]
            if (y === year) {
                data[num].push(element)
            } else {
                num++
                data[num] = []
                data[num].push(element)
                year = y
            }
        }
    }
    return data
}

// 图片处理相关功能
// ---------------------------------------------

/**
 * 获取对应主题的错误图片路径
 * @param {boolean} isDark - 是否为深色模式
 * @returns {string} - 错误图片路径
 */
export function getErrorImage(isDark) {
    return isDark ? '/images/loading-error-dark.webp' : '/images/loading-error-light.webp';
}

/**
 * 初始化图片错误处理
 * @param {boolean} isDark - 是否为深色模式
 */
export function initImages(isDark) {
    // 为所有图片添加错误处理
    document.querySelectorAll('img').forEach(img => {
        if (!img.onerror) {
            img.onerror = (event) => {
                event.target.setAttribute('loading-error', '');
                event.target.src = getErrorImage(isDark);
            };
        }
    });
}

/**
 * 初始化图片缩放功能
 * @param {Object} frontmatter - 页面的frontmatter数据
 */
export function initZoom(frontmatter) {
    // 判断是否禁用了缩放功能
    if (frontmatter.zoomable !== false) {
        // 使用medium-zoom库为图片添加缩放功能
        mediumZoom('.main img:not([no-zoomable])', { background: 'rgba(0,0,0,0.2)' });
    }
}

/**
 * 更新错误图片的源
 * @param {boolean} isDark - 是否为深色模式
 */
export function updateErrorImages(isDark) {
    const errorSrc = getErrorImage(isDark);
    document.querySelectorAll('img').forEach(img => {
        if (img.src.includes('loading-error')) {
            img.src = errorSrc;
        }
    });
}

/**
 * 初始化图片标题显示功能，将title属性显示为图片下方的标题
 */
export function initImageTitles() {
    if (typeof window === 'undefined') return;

    // 添加全局CSS样式
    function addTitleStyles() {
        if (document.getElementById('img-title-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'img-title-styles';
        styleElement.textContent = `
            /* 图片容器样式 */
            .vp-img-with-title {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 16px 0;
            }
            
            /* 图片标题样式 */
            .vp-img-title {
                margin-top: 12px;
                font-size: 0.9em;
                color: var(--vp-c-text-2);
                text-align: center;
                font-weight: 500;
            }
        `;

        document.head.appendChild(styleElement);
    }

    // 解析图片标题并添加到图片下方
    function parseImageTitle(img) {
        // 检查是否已有标题容器
        if (img.parentNode && img.parentNode.classList.contains('vp-img-with-title')) {
            return;
        }

        // 获取title属性
        const title = img.getAttribute('title');

        // 如果找到标题，则添加到图片下方
        if (title) {
            // 创建父容器
            const container = document.createElement('div');
            container.className = 'vp-img-with-title';

            // 插入容器到DOM
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);

            // 创建标题元素
            const titleElement = document.createElement('div');
            titleElement.className = 'vp-img-title';
            titleElement.textContent = title;
            container.appendChild(titleElement);
        }
    }

    // 处理页面上的所有图片
    function processImages() {
        const images = document.querySelectorAll('.vp-doc img');
        images.forEach(img => {
            parseImageTitle(img);
        });
    }

    // 监听DOM变化，处理新添加的图片
    function observeImages() {
        const observer = new MutationObserver((mutations) => {
            let hasNewImages = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    const images = mutation.target.querySelectorAll('img');
                    if (images.length > 0) {
                        hasNewImages = true;
                    }
                }
            });

            if (hasNewImages) {
                processImages();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 初始调用
    setTimeout(() => {
        // 添加全局样式
        addTitleStyles();

        // 处理页面图片
        processImages();

        // 监听DOM变化
        observeImages();
    }, 0);
}

/**
 * 时间处理相关函数
 * ---------------------------------------------
 */

/**
 * 格式化日期为字符串
 * @param {Date|string|number} date - 要格式化的日期
 * @param {string} format - 日期格式，默认为 'YYYY-MM-DD'
 * @returns {string} - 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';

    // 确保date是Date对象
    const dateObj = date instanceof Date ? date : new Date(date);

    // 如果日期无效，返回空字符串
    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 计算相对时间
 * @param {Date|string|number} date - 日期或时间戳
 * @param {Object} options - 配置选项
 * @param {number} options.maxDays - 最大天数，超过则显示完整日期，默认为7
 * @param {string} options.format - 完整日期的格式，默认为 'YYYY-MM-DD'
 * @param {boolean} options.suffix - 是否添加"前"或"后"后缀，默认为true
 * @param {string} options.nowText - "刚刚"的文本，默认为"刚刚"
 * @param {Object} options.texts - 自定义文本
 * @returns {string} - 相对时间字符串
 */
export function getRelativeTime(date, options = {}) {
    if (!date) return '';

    // 默认选项
    const defaultOptions = {
        maxDays: 7,               // 超过7天显示完整日期
        format: 'YYYY-MM-DD',     // 完整日期格式
        suffix: true,             // 是否显示"前"或"后"
        nowText: '刚刚',           // "刚刚"文本
        texts: {
            now: '刚刚',
            second: '秒',
            minute: '分钟',
            hour: '小时',
            day: '天',
            week: '周',
            month: '个月',
            year: '年'
        }
    };

    // 合并选项
    const opts = { ...defaultOptions, ...options };

    // 确保date是Date对象
    const targetDate = date instanceof Date ? date : new Date(date);

    // 如果日期无效，返回空字符串
    if (isNaN(targetDate.getTime())) return '';

    const now = new Date();
    const diff = now - targetDate; // 毫秒差
    const diffAbs = Math.abs(diff);
    const isPast = diff > 0;  // 是否是过去的时间

    // 时间单位（毫秒）
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    // 如果超过最大天数，返回完整日期
    if (diffAbs > opts.maxDays * day) {
        return formatDate(targetDate, opts.format);
    }

    // 计算相对时间
    let value, unit;

    if (diffAbs < 10 * second) {
        return opts.texts.now;
    } else if (diffAbs < minute) {
        value = Math.floor(diffAbs / second);
        unit = opts.texts.second;
    } else if (diffAbs < hour) {
        value = Math.floor(diffAbs / minute);
        unit = opts.texts.minute;
    } else if (diffAbs < day) {
        value = Math.floor(diffAbs / hour);
        unit = opts.texts.hour;
    } else if (diffAbs < week) {
        value = Math.floor(diffAbs / day);
        unit = opts.texts.day;
    } else if (diffAbs < month) {
        value = Math.floor(diffAbs / week);
        unit = opts.texts.week;
    } else if (diffAbs < year) {
        value = Math.floor(diffAbs / month);
        unit = opts.texts.month;
    } else {
        value = Math.floor(diffAbs / year);
        unit = opts.texts.year;
    }

    // 构建相对时间字符串
    let relativeTime = `${value}${unit}`;

    // 添加后缀
    if (opts.suffix) {
        relativeTime += isPast ? opts.texts.front : opts.texts.back;
    }

    return relativeTime;
}

/**
 * 移动元素到目标元素的指定位置
 * @param {string} sourceSelector - 要移动的元素选择器
 * @param {string} targetSelector - 目标元素选择器
 * @param {string} [position='before'] - 插入方式：before(前面), after(后面), replace(替换), append(作为子元素)
 */
export function moveElement(sourceSelector, targetSelector, position = 'before') {
    const source = document.querySelector(sourceSelector)
    const target = document.querySelector(targetSelector)
    if (!source || !target) return
    switch (position) {
        case 'before':
            if (target.parentNode) target.parentNode.insertBefore(source, target)
            break
        case 'after':
            if (target.parentNode) target.parentNode.insertBefore(source, target.nextSibling)
            break
        case 'replace':
            if (target.parentNode) target.parentNode.replaceChild(source, target)
            break
        case 'append':
            target.appendChild(source)
            break
        default:
            if (target.parentNode) target.parentNode.insertBefore(source, target)
    }
}

// 节流函数
function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last > delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}

/**
 * 滚动时自动将最近的标题id同步到URL hash（节流优化）
 * 只有 frontmatter.AutoAnchor === true 时才启用
 */
export function setupAutoAnchorOnScroll(frontmatter) {
    if (typeof window === 'undefined' || frontmatter.AutoAnchor !== true) return () => { };

    // 只在PC端生效
    const isPC = () => {
        return !/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    if (!isPC()) return () => { };
    const headingsSelector = '.vp-doc h2[id], .vp-doc h3[id]';
    const offset = 150; // 顶部导航栏高度

    const syncHash = throttle(() => {
        const headings = Array.from(document.querySelectorAll(headingsSelector));
        if (!headings.length) return;
        const scrollY = window.scrollY || window.pageYOffset;
        let currentId = '';
        for (let i = 0; i < headings.length; i++) {
            const el = headings[i];
            if (el.getBoundingClientRect().top + window.scrollY - offset <= scrollY) {
                currentId = el.id;
            } else {
                break;
            }
        }
        if (currentId && location.hash !== '#' + currentId) {
            history.replaceState(null, '', '#' + currentId);
        }
    }, 100);

    window.addEventListener('scroll', syncHash);

    // 返回解绑函数
    return () => {
        window.removeEventListener('scroll', syncHash);
    };
}

