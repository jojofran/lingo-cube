#!/bin/bash
# AUTO_UPDATE.sh - 自动从 git 历史生成 HANDOFF.md
# 每次完成任务后自动运行，或手动运行：bash .sisyphus/AUTO_UPDATE.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HANDOFF="$PROJECT_ROOT/.sisyphus/HANDOFF.md"

echo "🔄 自动更新 HANDOFF.md..."

# 获取最新 git 信息
LATEST_COMMIT=$(git -C "$PROJECT_ROOT" log --oneline -1)
RECENT_COMMITS=$(git -C "$PROJECT_ROOT" log --oneline -10)
GIT_STATUS=$(git -C "$PROJECT_ROOT" status --short)

# 读取当前进度
CURRENT_TASK=$(grep '🎯' "$PROJECT_ROOT/.sisyphus/REFACTOR_PLAN.md" 2>/dev/null | awk '{print $3}' || echo "未知")
COMPLETED=$(grep '✅' "$PROJECT_ROOT/.sisyphus/REFACTOR_PLAN.md" 2>/dev/null | sed 's/.*: //' || echo "")

# 检查构建状态
cd "$PROJECT_ROOT/lingo_cube_web"
BUILD_STATUS=""
if npm run build > /dev/null 2>&1; then
  BUILD_STATUS="✅ 通过"
else
  BUILD_STATUS="❌ 失败"
fi

# 生成新的 HANDOFF.md
cat > "$HANDOFF" << HANDOFF_EOF
# 🔴 Lingo Cube 重构项目 - 会话延续文档

**⚠️ MANDATORY READ: 新会话开始必须读取此文件**

**最后更新**: $(date +"%Y-%m-%d %H:%M")  
**最新提交**: $LATEST_COMMIT

---

## 🚨 新会话恢复指令（立即执行）

**如果你是 Sisyphus 且这是一个新会话：**
1. **你正在读这个文件** ✅ （好！）
2. 立即执行：\`git log --oneline -10\`
3. 立即执行：\`git status\`
4. 等待用户指令，或如果用户说"继续"则直接继续

---

## ✅ 最近完成工作

### Git 提交历史（最近 10 条）
\`\`\`
$RECENT_COMMITS
\`\`\`

### Git 状态
\`\`\`
$GIT_STATUS
\`\`\`

---

## 📊 项目健康状态

| 检查项 | 状态 |
|--------|------|
| 前端构建 | $BUILD_STATUS |
| Git 状态 | $([ -z "$GIT_STATUS" ] && echo "✅ 干净" || echo "⚠️ 有变更") |
| 最新提交 | $LATEST_COMMIT |

---

## 🎯 当前进度

| 维度 | 当前任务 |
|------|---------|
| 重构 (R) | $([ "$CURRENT_TASK" = R-* ] && echo "$CURRENT_TASK" || echo "") |
| 功能 (F) | $([ "$CURRENT_TASK" = F-* ] && echo "$CURRENT_TASK" || echo "") |
| 测试 (T) | $([ "$CURRENT_TASK" = T-* ] && echo "$CURRENT_TASK" || echo "") |

读取 \`.sisyphus/REFACTOR_PLAN.md\` 获取完整进度。

---

## 🔗 快速导航

| 文件 | 用途 |
|------|------|
| \`.sisyphus/REFACTOR_PLAN.md\` | 极简进度（3行） |
| \`.sisyphus/plans/R/index.md\` | 重构概览 |
| \`.sisyphus/plans/F/index.md\` | 功能概览 |
| \`.sisyphus/plans/T/index.md\` | 测试概览 |
| \`AGENTS.md\` | 项目技术栈、架构、规则 |

---

**项目状态**: 自动更新于 $(date)
HANDOFF_EOF

echo "✅ HANDOFF.md 已自动更新"
echo "📄 文件位置: $HANDOFF"
