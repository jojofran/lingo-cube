# Lingo Cube - 项目文档

## 项目概述

Lingo Cube 是一个前后端分离的 IELTS 英语打字练习项目。前端 Vue 3 + TypeScript，后端 Go + Gin。

## 技术栈

| 层     | 技术                          |
| ------ | ----------------------------- |
| 前端   | Vue 3 + TypeScript + Vite     |
| 后端   | Go 1.16 + Gin v1.7.7          |
| 部署   | GitHub Pages (前端) / Docker  |

## 开发命令

```bash
# 前端 (端口 3000, listen 0.0.0.0)
cd lingo_cube_web && npm run dev

# 后端 (端口 8080)
cd lingo_cube_server && go run main.go

# 类型检查 (vue-tsc)
cd lingo_cube_web && npx vue-tsc --noEmit

# 构建
cd lingo_cube_web && npm run build   # 含 vue-tsc 类型检查
cd lingo_cube_server && go build -o server .
```

## 注意事项

1. **Go 版本**: 当前 Go 1.16，Gin 固定 v1.7.7（不可升级）。`math/rand.Seed()` 而非 `rand.New(rand.NewSource(...))`。
2. **前端构建**: `npm run build` 会先执行 `vue-tsc` 类型检查，任何 TS 错误都会阻塞构建。开发模式 `npm run dev` 跳过类型检查。
3. **Vite 配置**: `host: '0.0.0.0'`, `base: '/lingo-cube/'`（适配 GitHub Pages）。
4. **路由使用 hash 模式** (`createWebHashHistory`)，适配 GitHub Pages 静态托管。
5. **API 代理**: Vite dev server 将 `/api/*` 代理到 `http://localhost:8080`。
6. **npm registry**: 本地配置了 cnpmjs 镜像，网络问题时可切到 `https://registry.npmjs.org/`。

## CI/CD

- 推送到 `main` 分支且涉及 `lingo_cube_web/**` 时，GitHub Actions 自动构建并部署到 GitHub Pages。
- 前端部署地址: `https://jojofran.github.io/lingo-cube/`
- 需要 GitHub Pages Source 设为 "GitHub Actions"。

## 前端架构要点

- **主页面**: `src/views/TypingGame.vue` — 打字练习游戏核心组件（~1200 行），含 3 个主题、2 种模式。
- **词库**: `src/views/wordBank.ts` — 220+ IELTS 词条，含 english/chinese/phonetic 字段，`genPhonetic()` 自动生成音标。
- **API 客户端**: `src/api/word.ts` — 优先从 API 获取词库，网络失败时 fallback 到本地词库。
- **主题系统**: 通过 `theme` ref (`'dark' | 'ins' | 'cute'`) + CSS class (`theme-ins` / `theme-cute`) 切换。主题切换按钮在右上角固定（`.theme-toggle-global`）。
- **移动端适配**: `@media (max-width: 768px)`，标题隐藏，元素缩小，无自动滚动。

## 后端 API

| 端点 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/words` | 全量词库 |
| `GET /api/words/random?count=20` | 随机词条 (max 50) |
| `GET /api/words/:english` | 单词详情 |

统一响应: `{ "code": 0, "message": "ok", "data": {} }`

## Git

- 仓库: `git@github.com:jojofran/lingo-cube.git`
- `server` 二进制和 `node_modules/`、`dist/` 已在 .gitignore 中排除
- SSH key: `~/.ssh/id_ed25519`，已配置 GitHub
