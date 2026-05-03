# R - 重构概览

| ID | 目标 | 文件 |
|----|------|------|
| R-A-1 | 集成 gameSession store 到 TypingGame | R/A.md |
| R-A-2 | 移除组件内独立状态，统一用 store | R/A.md |
| R-A-3 | 验证跨组件状态共享 + build通过 | R/A.md |
| R-B-1 | shallowRef 优化 wordBank 等大对象 | R/B.md |
| R-B-2 | PromptCard/StatsRow 添加 v-memo | R/B.md |
| R-B-3 | 游戏组件懒加载 | R/B.md |
| R-C-1 | 提取 PromptCard 为通用 WordCard 组件 | R/C.md |
| R-D-1 | 删除死代码 useScoring.ts | R/D.md |
| R-D-2 | 统一主题 class 书写模式 | R/D.md |
| R-D-3 | 移除 ReviewPage localStorage 兜底 | R/D.md |
| R-D-4 | 提取内联 SVG 到共享组件 Icon.vue | R/D.md |
| R-D-5 | 字体家族提取到全局 CSS | R/D.md |
| R-D-6 | 提取 WordList 共享组件 + 修复 WordListItem 布局 | R/D.md |
| R-E-1 | 删除后端 genPhonetic 死代码 | R/E.md |
| R-E-2 | 收紧后端 CORS 配置 | R/E.md |
| R-E-3 | 后端词查找 O(1) 优化 | R/E.md |
| R-E-4 | 后端单元测试 | R/E.md |
