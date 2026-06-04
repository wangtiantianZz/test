let _diaries = null;
const THEME_KEY = 'diary-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';
const IMAGE_DIMENSIONS = {
    'images/spring-01.jpg': { width: 1744, height: 981 },
    'images/spring-02.jpg': { width: 1200, height: 900 },
    'images/spring-03.jpg': { width: 1200, height: 900 }
};

async function loadDiariesData() {
    if (_diaries) return _diaries;

    const res = await fetch('data/diaries.json');
    if (!res.ok) {
        throw new Error(`Failed to load diaries: ${res.status}`);
    }

    _diaries = await res.json();
    return _diaries;
}

function getAllDiaries() {
    return _diaries || [];
}

function getDiaryById(id) {
    return (_diaries || []).find(d => d.id === parseInt(id, 10));
}

function getFeaturedDiary(diaries) {
    const list = diaries || [];
    return list.find(diary => diary.featured) || getSortedDiaries(list, 'desc')[0] || null;
}

function getSortedDiaries(diaries, order = 'desc') {
    const list = [...(diaries || [])];
    list.sort((left, right) => {
        const leftTime = parseLocalDate(left.date).getTime();
        const rightTime = parseLocalDate(right.date).getTime();
        if (leftTime === rightTime) return right.id - left.id;
        return order === 'asc' ? leftTime - rightTime : rightTime - leftTime;
    });
    return list;
}

function parseLocalDate(dateStr) {
    const [year, month, day] = String(dateStr).split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(dateStr) {
    return parseLocalDate(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getRelativeTime(dateStr) {
    const diff = Math.floor((new Date() - parseLocalDate(dateStr)) / 86400000);
    if (diff < 0) return '即将到来';
    if (diff === 0) return '今天';
    if (diff === 1) return '昨天';
    if (diff < 30) return `${diff}天前`;
    if (diff < 365) return `${Math.floor(diff / 30)}个月前`;
    return `${Math.floor(diff / 365)}年前`;
}

function getTodayStr() {
    return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

function estimateReadTime(content) {
    const chars = (content || []).filter(i => i.type === 'text').reduce((s, i) => s + i.value.length, 0);
    return Math.max(1, Math.ceil(chars / 300));
}

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHTML(value);
}

function getImageSizeAttrs(src) {
    const dimensions = IMAGE_DIMENSIONS[src];
    if (!dimensions) return '';
    return `width="${dimensions.width}" height="${dimensions.height}"`;
}

function parseMarkdown(text) {
    return escapeHTML(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>');
}

function readStoredTheme() {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === THEME_DARK || theme === THEME_LIGHT) return theme;
    return null;
}

function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === THEME_DARK);
}

function initTheme() {
    const storedTheme = readStoredTheme();
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? THEME_DARK : THEME_LIGHT);
    applyTheme(initialTheme);
    return initialTheme;
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains('dark-mode') ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
    return nextTheme;
}

function bindThemeToggle(buttonId = 'themeToggle') {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const syncButtonText = () => {
        const isDark = document.body.classList.contains('dark-mode');
        button.textContent = isDark ? '切换亮色' : '切换暗色';
        button.setAttribute('aria-pressed', String(isDark));
    };

    button.addEventListener('click', () => {
        toggleTheme();
        syncButtonText();
    });

    syncButtonText();
}

function initLightbox() {
    if (document.getElementById('lightbox')) return;
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.innerHTML = '<img src="" alt="">';
    document.body.appendChild(lb);
    const img = lb.querySelector('img');

    const closeLightbox = () => {
        lb.classList.remove('active');
        setTimeout(() => { lb.style.display = 'none'; }, 250);
    };

    lb.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && lb.classList.contains('active')) closeLightbox();
    });
    document.addEventListener('click', e => {
        if (e.target.tagName === 'IMG' && e.target.closest('.diary-content')) {
            img.src = e.target.src;
            lb.style.display = 'flex';
            setTimeout(() => lb.classList.add('active'), 10);
        }
    });
}

function initBackToTop(buttonId = 'backToTopBtn') {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const onScroll = () => {
        const isVisible = window.scrollY > 260;
        button.classList.toggle('visible', isVisible);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    onScroll();
}
