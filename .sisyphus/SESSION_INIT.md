# 初始化命令（请执行）:

# Step 1: 读取进度
cat .sisyphus/REFACTOR_PLAN.md 2>/dev/null || echo "⚠️ REFACTOR_PLAN.md 不存在，项目可能未初始化"

# Step 2: 检查 Git 状态
git log --oneline -5
git status --short

# Step 3: 一致性检查（按前缀R/F/T分类）
PLAN=$(cat .sisyphus/REFACTOR_PLAN.md 2>/dev/null)

if [ -n "$PLAN" ]; then
  echo ""
  echo "=== 进度一致性检查 ==="  
  
  # 检查最近5个提交
  git log -5 --pretty="%h %s" 2>/dev/null | while read -r HASH MSG; do
    # 提取完整ID：前缀-子类-步骤 (如 R-A-1, F-B-2, T-A-1)
    COMMIT_ID=$(echo "$MSG" | grep -oE '[RFT]-[A-Z]-[0-9]+' | head -1)
    
    if [ -n "$COMMIT_ID" ]; then
      # 判断类型前缀
      PREFIX=$(echo "$COMMIT_ID" | cut -d'-' -f1)
      case "$PREFIX" in
        R) TYPE="重构" ;;
        F) TYPE="功能" ;;
        T) TYPE="测试" ;;
        *) TYPE="其他" ;;
      esac
      
      # 检查在PLAN中的状态
      if echo "$PLAN" | grep '✅' | grep -q "$COMMIT_ID"; then
        echo "✅ [$TYPE] $COMMIT_ID 与进度匹配 ($HASH)"
      elif echo "$PLAN" | grep '🎯' | grep -q "$COMMIT_ID"; then
        echo "⚠️ [$TYPE] 提交含 $COMMIT_ID 但 🎯 仍指向它 ($HASH)"
      elif echo "$PLAN" | grep '⏳' | grep -q "$COMMIT_ID"; then
        echo "⚠️ [$TYPE] 提交含 $COMMIT_ID 但它在 ⏳（待执行）中 ($HASH)"
      else
        echo "ℹ️ [$TYPE] 提交含计划外 ID: $COMMIT_ID ($HASH)"
      fi
    else
      echo "ℹ️ 日常变更: $HASH $MSG"
    fi
  done
fi
