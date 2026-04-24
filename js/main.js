let _diaries = null;
const THEME_KEY = 'diary-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

async function loadDiariesData() {
    if (_diaries) return _diaries;
    const res = await fetch('data/diaries.json');
    _diaries = await res.json();
    return _diaries;
}

function getAllDiaries() {
    return _diaries || [];
}

function getDiaryById(id) {
    return (_diaries || []).find(d => d.id === parseInt(id, 10));
}

function getSortedDiaries(diaries, order = 'desc') {
    const list = [...(diaries || [])];
    list.sort((left, right) => {
        const leftTime = new Date(left.date).getTime();
        const rightTime = new Date(right.date).getTime();
        if (leftTime === rightTime) return right.id - left.id;
        return order === 'asc' ? leftTime - rightTime : rightTime - leftTime;
    });
    return list;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getRelativeTime(dateStr) {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
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
    const chars = content.filter(i => i.type === 'text').reduce((s, i) => s + i.value.length, 0);
    return Math.max(1, Math.ceil(chars / 300));
}

function parseMarkdown(text) {
    return text
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
        button.textContent = document.body.classList.contains('dark-mode') ? '切换亮色' : '切换暗色';
    };

    button.addEventListener('click', () => {
        toggleTheme();
        syncButtonText();
    });

    syncButtonText();
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
