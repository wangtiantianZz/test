# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人生活日记网站，纯静态前端，部署于 GitHub Pages。

## 开发

无构建工具，无包管理器。

- **本地运行**：必须通过 HTTP 服务器访问（VS Code Live Server 或 `python -m http.server`）。直接用 `file://` 打开会因 CORS 导致 `fetch('data/diaries.json')` 失败。
- **部署**：推送到 `main` 分支即自动发布（GitHub Pages，自定义域名见 `CNAME`）。

## 项目结构

```
├── index.html          # 首页：日记卡片列表 + 搜索 + 标签过滤
├── diary.html          # 详情页：单篇日记，?id= 参数加载
├── css/style.css       # 全局样式，响应式，含卡片/标签/搜索栏
├── js/main.js          # 共享工具函数 + 数据加载
├── data/diaries.json   # 日记数据源
└── images/             # 本地封面及正文图片
```

## 架构

**数据流**：`js/main.js` 的 `loadDiariesData()` 异步 fetch `data/diaries.json` 并缓存，两个页面在渲染前均需调用。

**日记数据格式**（`data/diaries.json`）：

```json
{
  "id": 1,
  "date": "2026-04-10",
  "title": "标题",
  "tags": ["标签1", "标签2"],
  "cover": "images/xxx.jpg",
  "summary": "摘要",
  "content": [
    { "type": "text", "value": "支持 **粗体** *斜体* ## 标题" },
    { "type": "image", "value": "images/xxx.jpg" }
  ]
}
```

**`js/main.js` 工具函数**：

| 函数 | 用途 |
|------|------|
| `loadDiariesData()` | 异步加载并缓存 JSON 数据 |
| `getAllDiaries()` | 返回全部日记数组 |
| `getDiaryById(id)` | 按 id 查找单篇 |
| `formatDate(dateStr)` | 格式化为中文日期 |
| `getRelativeTime(dateStr)` | 返回"X天前/昨天/今天" |
| `getTodayStr()` | 返回含星期的完整日期 |
| `estimateReadTime(content)` | 按 300字/分钟 估算阅读时长 |
| `parseMarkdown(text)` | 解析粗体、斜体、标题 |

## 视觉风格

- 配色：主色 `#667eea` → `#764ba2` 渐变，背景 `#faf8f5`
- 卡片：圆角 16px，hover 上浮 + 加深阴影
- 响应式：768px 断点，移动端单列布局
- 标签徽章：`#f0eeff` 背景 + `#667eea` 文字
