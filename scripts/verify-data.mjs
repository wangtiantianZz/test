import { access, readFile } from 'node:fs/promises';

const diaryPath = new URL('../data/diaries.json', import.meta.url);
const root = new URL('../', import.meta.url);
const diaries = JSON.parse(await readFile(diaryPath, 'utf8'));
const ids = new Set();
const failures = [];

if (!Array.isArray(diaries)) failures.push('data/diaries.json must be an array');

for (const diary of Array.isArray(diaries) ? diaries : []) {
    if (!Number.isInteger(diary.id)) failures.push(`Invalid id: ${diary.id}`);
    if (ids.has(diary.id)) failures.push(`Duplicate id: ${diary.id}`);
    ids.add(diary.id);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(diary.date || '')) failures.push(`Invalid date for id ${diary.id}: ${diary.date}`);
    if (!diary.title) failures.push(`Missing title for id ${diary.id}`);
    if (!Array.isArray(diary.tags)) failures.push(`Missing tags array for id ${diary.id}`);
    if (!Array.isArray(diary.content)) failures.push(`Missing content array for id ${diary.id}`);

    const imagePaths = [
        diary.cover,
        ...(diary.content || []).filter(item => item.type === 'image').map(item => item.value)
    ].filter(Boolean);

    for (const imagePath of imagePaths) {
        try {
            await access(new URL(imagePath, root));
        } catch {
            failures.push(`Missing image for id ${diary.id}: ${imagePath}`);
        }
    }
}

if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
}

console.log(`Verified ${diaries.length} diaries`);
