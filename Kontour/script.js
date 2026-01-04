// ========================================
// 多语言功能
// ========================================

// 当前语言
let currentLanguage = 'zh-CN';

// 检测浏览器语言
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;

    // 将浏览器语言映射到我们支持的语言
    if (browserLang.startsWith('zh')) {
        if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('Hant')) {
            return 'zh-TW';
        }
        return 'zh-CN';
    } else if (browserLang.startsWith('ja')) {
        return 'ja';
    } else if (browserLang.startsWith('ko')) {
        return 'ko';
    } else {
        return 'en';
    }
}

// 获取嵌套对象的值
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// 切换语言
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);

    // 更新所有具有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedValue(translations[lang], key);

        if (translation) {
            if (element.innerHTML.includes('<br>')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // 更新当前语言显示
    document.getElementById('currentLang').textContent = translations[lang].name;

    // 更新语言选项的激活状态
    document.querySelectorAll('.lang-option').forEach(option => {
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// 初始化语言
function initLanguage() {
    // 优先使用用户之前选择的语言
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // 否则自动检测浏览器语言
        currentLanguage = detectBrowserLanguage();
    }

    changeLanguage(currentLanguage);
}

// 语言选择器事件
function setupLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');

    // 点击按钮切换下拉菜单
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langBtn.classList.toggle('active');
        langDropdown.classList.toggle('show');
    });

    // 点击语言选项
    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = option.getAttribute('data-lang');
            changeLanguage(lang);
            langDropdown.classList.remove('show');
            langBtn.classList.remove('active');
        });
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        langDropdown.classList.remove('show');
        langBtn.classList.remove('active');
    });
}

// ========================================
// 其他功能
// ========================================

// 平滑滚动效果（针对不支持CSS scroll-behavior的浏览器）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 导航栏滚动效果
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // 添加阴影效果
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }

    lastScroll = currentScroll;
});

// 页面加载动画
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 功能卡片进入视口动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 观察所有功能卡片和格式组
document.querySelectorAll('.feature-card, .format-group').forEach(card => {
    observer.observe(card);
});

// 下载按钮点击事件（示例）
document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.querySelector('.platform-name').textContent;

        // 这里可以添加实际的下载逻辑
        alert(`感谢下载 Kontour for ${platform}！\n\n实际使用时，请在这里添加真实的下载链接。`);
    });
});

// 响应式菜单（移动端）
function createMobileMenu() {
    const navbar = document.querySelector('.navbar .container');
    const navLinks = document.querySelector('.nav-links');

    // 创建汉堡菜单按钮
    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '☰';
    menuBtn.style.display = 'none';
    menuBtn.style.fontSize = '1.5rem';
    menuBtn.style.background = 'none';
    menuBtn.style.border = 'none';
    menuBtn.style.cursor = 'pointer';
    menuBtn.style.color = 'var(--text-dark)';

    // 移动端显示菜单按钮
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    function handleMobileMenu(e) {
        if (e.matches) {
            menuBtn.style.display = 'block';
            navLinks.style.display = 'none';
        } else {
            menuBtn.style.display = 'none';
            navLinks.style.display = 'flex';
        }
    }

    mediaQuery.addListener(handleMobileMenu);
    handleMobileMenu(mediaQuery);

    // 菜单按钮点击事件
    menuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'none' || navLinks.style.display === '') {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '60px';
            navLinks.style.right = '20px';
            navLinks.style.backgroundColor = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.borderRadius = '8px';
            navLinks.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navLinks.style.display = 'none';
        }
    });

    navbar.appendChild(menuBtn);
}

// 初始化移动端菜单
createMobileMenu();

// 添加键盘导航支持
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const navLinks = document.querySelector('.nav-links');
        if (window.innerWidth <= 768) {
            navLinks.style.display = 'none';
        }
    }
});

console.log('Kontour 主页已加载完成！');

// ========================================
// 页面加载完成后初始化
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    // 初始化语言
    initLanguage();

    // 设置语言选择器
    setupLanguageSelector();

    console.log('当前语言:', currentLanguage);
});
