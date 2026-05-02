# Lingo Cube - 项目文档

## 🔴 MANDATORY SESSION INIT (新会话必须执行)

**⚠️ CRITICAL: 如果你是 Sisyphus 且这是一个新会话，你必须按以下顺序执行，不可跳过：**

### Step 1: 委托 subagent 执行初始化命令
```
task(description="Session init - read plan + git status", prompt="读取 .sisyphus/SESSION_INIT.md 并执行其中的所有命令，返回原始输出", ...)
```
不要手动执行任何命令，委托 subagent 完成。

如果 SESSION_INIT.md 不存在，委托 subagent 手动执行：
```
task(description="Manual git status fallback", prompt="执行 git log --oneline -10 和 git status --short，返回结果", ...)
```

### Step 2: 委托 subagent 解析进度并展示（按类型分开展示）

**⚠️ 从 plans/{prefix}/index.md 提取描述：读取 index.md 中的表格，提取每个 ID 的 目标 列。**

```
task(description="Parse refactor plan from index files", prompt="读取 .sisyphus/REFACTOR_PLAN.md 和所有 index.md，按类型R/F/T解析:

对每种类型 (R=重构, F=功能, T=测试):
1. 统计该类型已完成数（✅行中该前缀的ID数）
2. 统计该类型待执行数（⏳行中该前缀的ID数）
3. **读取 plans/R/index.md（表格含 ID | 目标 | 文件）**
4. **读取 plans/F/index.md**
5. **读取 plans/T/index.md**
6. 从表格中提取每个 ID 对应的 目标（描述）
7. 找出该类型的🎯当前任务
8. 按子类分组，每个ID附带描述

返回格式化后的展示文本，格式:
- 紧凑列表: ⏳ R-A: [A-1 A-2 A-3]
- 展开描述:
    A-1 → 集成 gameSession store 到 TypingGame
    A-2 → 移除组件内独立状态
", ...)
```

**执行完成后，按类型分开展示进度并等待用户指令：**

展示示例：
```
=== 项目进度概览 ===

✅ 总计完成: 10 项 | ⏳ 总计待执行: 15 项
🎯 当前任务: R-A-1 → 集成 gameSession store to TypingGame

📦 重构 (R) - 已完成 0/6
  ⏳ R-A: [A-1 A-2 A-3]
    A-1 → 集成 gameSession store to TypingGame
    A-2 → 优化 store 性能
    A-3 → 添加持久化支持
  ⏳ R-B: [B-1 B-2 B-3]
    B-1 → 重构组件结构
    B-2 → 优化渲染性能
    B-3 → 添加虚拟滚动
  🎯 当前: R-A-1

🚀 功能 (F) - 已完成 0/4  
  ⏳ F-A: [A-1 A-2]
    A-1 → 新增拼写模式
    A-2 → 添加计时器
  ⏳ F-B: [B-1]
    B-1 → 用户登录
  ⏳ F-C: [C-1]
    C-1 → 词库管理
  🎯 当前: F-A-1

🧪 测试 (T) - 已完成 0/5
  ⏳ T-A: [A-1 A-2 A-3 A-4]
    A-1 → useScoring 单元测试
    A-2 → useTimer 单元测试
    A-3 → useWordProvider 单元测试
    A-4 → useGameConfig 单元测试
  ⏳ T-B: [B-1]
    B-1 → E2E 游戏流程测试
  🎯 当前: T-A-1

📜 历史任务 - 已完成 10/10
  ✅ A: [1 2 3 4 5 6 7 8] E: [1 2]

说"继续"执行 🎯 | 说 ID 执行指定任务
```



**指令映射：**
- 用户说"继续" / "继续重构" → 执行 🎯 当前索引
- 用户说索引 ID（如 R-A-1、F-B-1） → 按 ID 三段式定位文件执行
- 用户说 `!ID`（如 `!R-A-1`） → 强制重跑已完成的索引
- 用户说具体任务 → 结合索引上下文执行

**一致性提示**：初始化阶段 `.sisyphus/SESSION_INIT.md` 会自动执行进度一致性检查，留意 ⚠️ 警告。

### Step 3: 进度漂移处理（可选）

如果一致性检查发出 ⚠️ 警告（提交含 🎯 ID 但计划未更新），说明有人做了提交但未更新进度文件：

**处理流程：**
1. 读取 `git log --oneline -5`，了解最近提交的内容
2. 判断提交是否涉及计划内的重构/功能/测试工作
3. 如果是 → 向用户提议更新 REFACTOR_PLAN.md（自动调整 ✅/⏳/🎯）
4. 如果否（纯文档/配置修改） → 解释警告原因，无需处理

**三种输出场景：**

| 场景 | SESSION_INIT 输出 | 说明 |
|------|-------------------|------|
| ✅ 进度匹配 | `✅ 提交(R-A-1)与进度匹配` | 提交ID已在 ✅ 中，🎯 已推进，正常 |
| ⚠️ 进度落后 | `⚠️ 提交含 R-A-1 但 🎯 仍指向它` | 提交了但忘更 PLAN，需更新 |
| ℹ️ 无关变更 | `ℹ️ 最新提交不含计划 ID` | 文档/配置修改，无需处理 |

**本地修改不影响进度**：`git status --short` 中的本地修改与 REFACTOR_PLAN 无关，仅提醒有未提交变更。计划状态由最近提交决定。

**示例对话：**
```
⚠️ 提交含 R-A-1 但 🎯 仍指向它

最近提交:
  a1b2c3d feat: integrate gameSession store (R-A-1)

这表示 R-A-1 已做完但没更新 PLAN。
是否要我更新 REFACTOR_PLAN.md（将 R-A-1 移到 ✅，🎯 设为 R-A-2）？
```

**❌ 禁止行为：**
- ❌ 不要手动执行 SESSION_INIT.md 中的命令
- ❌ 不要假设上下文仍然存在
- ❌ 不要跳过任何步骤
- ❌ 初始化阶段不要读取 HANDOFF.md（按需时才加载）
- ❌ 不要在初始化完成前等待用户指令

**✅ 正确行为：**
- ✅ 新会话第 1 件事：委托 subagent 执行 SESSION_INIT.md
- ✅ 第 2 件事：委托 subagent 解析进度并展示
- ✅ 只读索引（REFACTOR_PLAN.md），不加载全文
- ✅ 展示进度后等待用户指令

---

## 🔴 MANDATORY TASK COMPLETION (任务完成必须执行)

**⚠️ CRITICAL: 每次完成任务后，你必须更新 HANDOFF.md：**

### 自动更新方法（推荐）
```bash
bash .sisyphus/AUTO_UPDATE.sh
```
注意：如果 git post-commit hook 已配置，commit 后会自动运行此脚本。

### 强制步骤（规则 11 要求）
1. 将 🎯 从"当前"行移到"已完成"行
2. 取"待执行"行第一个索引设为新 🎯
3. commit 信息包含当前索引 ID

### 手动更新要求
如果自动脚本失败，手动更新 `.sisyphus/HANDOFF.md`：
1. 更新"最后更新"时间戳
2. 添加新的 git 提交到"最近完成工作"
3. 更新"项目健康状态"
4. 如有新任务，更新"下一步建议"

### 验证步骤（输出承诺前必须完成）
- [ ] HANDOFF.md 已更新（运行 `bash .sisyphus/AUTO_UPDATE.sh` 或手动更新）
- [ ] SESSION_INIT.md 如需要也更新
- [ ] 对用户报告：已完成 X，HANDOFF.md 已更新
- [ ] 运行 `git log --oneline -1` 确认最新提交已记录
- [ ] 运行 `git log --oneline -1` 确认最新提交已记录

**❌ 禁止行为：**
- ❌ 完成任务后不更新 HANDOFF.md
- ❌ 假设下次会话还能记住上下文
- ❌ 跳过文档更新步骤
- ❌ 输出 `<promise>` 之前不运行 AUTO_UPDATE.sh

**✅ 正确行为：**
- ✅ 任务完成 → 立即运行 `bash .sisyphus/AUTO_UPDATE.sh`
- ✅ 报告完成 → 同时告知"HANDOFF.md 已更新"
- ✅ 下次会话 → 读取最新 HANDOFF.md，上下文完整
- ✅ 输出 `<promise>` → 仅在验证步骤全部完成后

---

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

---

## 🔄 索引锁定规则（Token 极简模式）

**所有进度、任务、代码标记，仅识别 `字母-数字` 格式的唯一 ID（如 A-1、R-A-1、F-B-1）**

### ID 格式约定
```
三段式: {prefix}-{section}-{step}
  示例: R-A-1  → prefix=R(重构), section=A(Pinia集成), step=1(集成store)
  路径: .sisyphus/plans/R/A.md → 查找章节 ## A-1
         .sisyphus/plans/F/B.md → 查找章节 ## B-1
         .sisyphus/plans/T/A.md → 查找章节 ## A-1
  规则: 前缀→目录名, 子类→文件名, 章节→## {section}-{step}
```

### 执行规则
1. **续跑**：仅读 `.sisyphus/REFACTOR_PLAN.md` 获取索引状态，无需读详细任务描述
2. **执行**：按 ID 三段式定位文件 `.sisyphus/plans/{prefix}/{section}.md` → `## {section}-{step}`
3. **验证**：按 task 中 `验证:` 声明执行（若无声明则仅检查 LSP diagnostics）
4. **强制重跑**：用户输入 `!{ID}`（如 `!R-A-1`）→ 忽略 ✅ 状态，强制重新执行
5. **防重复**：禁止执行已标记 ✅ 的索引 ID，除非指令以 `!` 开头
6. **输出极简**：仅反馈当前索引 ID 状态，不输出冗余描述
7. **代码标记**：完成文件顶部加 `// REFACTORED: [索引ID]`
8. **任务完成**：验证通过后，立即更新 REFACTOR_PLAN.md 状态标记（具体步骤见规则 11）
9. **提交约束**：commit 信息必须包含当前索引 ID（如 `feat: integrate store (R-A-1)`）
10. **上下文恢复**：新会话仅需读取 REFACTOR_PLAN.md（1行）即可了解全貌
11. **强制进度更新**（验证通过后必须在同一次 git 提交中完成）：
    - 将 🎯 从"当前"行移至"已完成"行
    - 取"待执行"行第一个索引设为新的 🎯
    - commit 信息格式 `{type}: {描述} ({索引ID})`
12. **示例**：🎯 R-A-1 → 读 `plans/R/A.md` → `## A-1` 找到 `验证: npm run build` → 执行 + 验证 → 更新 PLAN → commit

### 三维度说明
| 前缀 | 含义 | 子类 | 示例 |
|------|------|------|------|
| R | 重构 (Refactor) | R-A:Pinia集成, R-B:性能优化 | R-A-1 |
| F | 功能 (Feature) | F-A:游戏模式, F-B:用户系统, F-C:词库管理 | F-B-1 |
| T | 测试 (Test) | T-A:单元测试, T-B:E2E测试 | T-A-3 |

---

## 🏗️ 计划生成规则（新建任务/功能时使用）

### 文件结构
```
.sisyphus/
├── REFACTOR_PLAN.md        # 总进度：✅已完成 / ⏳待执行 / 🎯当前
└── plans/
    ├── R/
    │   ├── index.md        # 表格: ID | 目标 | 文件
    │   ├── A.md            # ## A-N 详细内容 + 验证
    │   └── B.md
    ├── F/
    │   ├── index.md
    │   └── ...
    └── T/
        ├── index.md
        └── ...
```

### 创建新任务流程
```
用户请求 → "添加用户登录功能"
  ↓
1. 分配前缀: F（功能）, section: 按功能分组分配下个字母（如D）
2. 创建 plans/F/D.md:
   ## D-1 用户登录
   - 注册/登录表单
   - JWT token 管理
   验证: npm run build
3. 更新 plans/F/index.md 表格:
   | F-D-1 | 用户登录 | F/D.md |
4. 更新 REFACTOR_PLAN.md ⏳ 行末尾: +F-D-1
5. 🎯 保持当前不变（除非用户要求直接执行）
```

### ID 格式约定
```
三段式: {prefix}-{section}-{step}
  示例: F-D-1  → prefix=F(功能), section=D, step=1
  路径: plans/F/D.md → 查找 ## D-1
  规则: 前缀→目录名, 子类(大写字母)→文件名, 章节→## {section}-{step}
```

### 展示约定
```
子类分组下，ID 显示时省略前缀（避免冗余）:
  R-A: [A-1 A-2 A-3]     ← 完整ID: R-A-1, R-A-2, R-A-3
  F-B: [B-1 B-2]         ← 完整ID: F-B-1, F-B-2
  T-A: [A-1 A-2 A-3 A-4] ← 完整ID: T-A-1, T-A-2, T-A-3, T-A-4
完整ID 只在以下场景使用:
  - REFACTOR_PLAN.md 中（✅/⏳/🎯 行）
  - plans/{prefix}/index.md 表格的 ID 列
  - commit 信息中
  - 用户指定执行时（如说"执行 R-A-1"）
```
