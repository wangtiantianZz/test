function renderDiaryContent(content) {
    return content.map(item => {
        if (item.type === 'text') {
            const parsedText = parseMarkdown(item.value);
            if (/<h[23]>/.test(parsedText)) return `<div class="diary-text-block">${parsedText}</div>`;
            return `<p>${parsedText}</p>`;
        }
        if (item.type === 'image') return `<figure><img src="${escapeAttribute(item.value)}" loading="lazy" ${getImageSizeAttrs(item.value)} alt="日记图片" onerror="this.outerHTML='<div class=placeholder-img>图片加载失败</div>'"></figure>`;
        return '';
    }).join('');
}

function renderDiaryToc() {
    const tocBox = document.getElementById('diaryTocBox');
    const tocContainer = document.getElementById('diaryToc');
    const headings = Array.from(document.querySelectorAll('#diaryContent h2'));
    if (headings.length === 0) {
        tocBox.hidden = true;
        return;
    }

    tocContainer.innerHTML = '';
    headings.forEach((heading, index) => {
        const headingId = `section-${index + 1}`;
        heading.id = headingId;

        const link = document.createElement('a');
        link.href = `#${headingId}`;
        link.className = 'toc-link';
        link.textContent = heading.textContent;
        tocContainer.appendChild(link);
    });

    tocBox.hidden = false;
}

function buildDiaryNav(currentDiaryId, diaries) {
    const navContainer = document.getElementById('detailNav');
    const sortedDiaries = getSortedDiaries(diaries, 'desc');
    const currentIndex = sortedDiaries.findIndex(diary => String(diary.id) === String(currentDiaryId));
    if (currentIndex < 0) {
        navContainer.innerHTML = '';
        return;
    }

    const olderDiary = sortedDiaries[currentIndex + 1] || null;
    const newerDiary = sortedDiaries[currentIndex - 1] || null;

    const olderHtml = olderDiary
        ? `<a class="sibling-link" href="diary.html?id=${olderDiary.id}"><span>上一篇</span><strong>${escapeHTML(olderDiary.title)}</strong></a>`
        : `<span class="sibling-link disabled"><span>上一篇</span><strong>已经到底了</strong></span>`;

    const newerHtml = newerDiary
        ? `<a class="sibling-link next" href="diary.html?id=${newerDiary.id}"><span>下一篇</span><strong>${escapeHTML(newerDiary.title)}</strong></a>`
        : `<span class="sibling-link disabled next"><span>下一篇</span><strong>已经最新</strong></span>`;

    navContainer.innerHTML = `${olderHtml}${newerHtml}`;
}

function updateReadingProgress() {
    const progress = document.getElementById('readingProgress');
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

async function loadDiaryDetail() {
    const params = new URLSearchParams(window.location.search);
    const diaryId = params.get('id');
    if (!diaryId) { window.location.href = 'index.html'; return; }

    try {
        await loadDiariesData();
        const diary = getDiaryById(diaryId);

        if (!diary) {
            document.getElementById('diaryTitle').textContent = '日记不存在';
            document.getElementById('diarySummary').textContent = '这篇日记可能已经被移动或删除。';
            return;
        }

        document.getElementById('detailHero').style.setProperty('--hero-image', `url("${escapeAttribute(diary.cover)}")`);
        document.getElementById('diaryDate').textContent = formatDate(diary.date);
        document.getElementById('diaryMeta').innerHTML =
            `<span>${escapeHTML(diary.location || '生活现场')}</span><span>${escapeHTML(diary.weather || '晴朗')}</span><span>${escapeHTML(diary.mood || '片刻')}</span><span>约 ${estimateReadTime(diary.content)} 分钟阅读</span>`;
        document.getElementById('diaryTitle').textContent = diary.title;
        document.getElementById('diarySummary').textContent = diary.summary || '';
        document.getElementById('diaryTags').innerHTML = (diary.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('');
        document.getElementById('diaryContent').innerHTML = renderDiaryContent(diary.content);
        renderDiaryToc();
        buildDiaryNav(diary.id, getAllDiaries());
        document.title = `${diary.title} - 生活日记`;
        initLightbox();
        updateReadingProgress();
    } catch (error) {
        document.getElementById('diaryTitle').textContent = '日记加载失败';
        document.getElementById('diarySummary').textContent = '请稍后刷新页面重试。';
    }
}

initTheme();
bindThemeToggle();
initBackToTop();
window.addEventListener('scroll', updateReadingProgress, { passive: true });
window.addEventListener('resize', updateReadingProgress);
loadDiaryDetail();
