let _diaries = null;

async function loadDiariesData() {
    if (_diaries) return _diaries;
    const res = await fetch('data/diaries.json');
    _diaries = await res.json();
    return _diaries;
}

function getAllDiaries() { return _diaries; }

function getDiaryById(id) {
    return _diaries.find(d => d.id === parseInt(id));
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
