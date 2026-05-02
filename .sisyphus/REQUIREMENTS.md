# Requirements Registry

需求定义、生命周期、与模块/任务的关联。

**生命周期**: `proposed → in-progress → done → deprecated → removed`

---

## REQ-001: 核心打字练习
| 字段 | 值 |
|------|-----|
| **状态** | ✅ done |
| **优先级** | P0 |
| **起源** | 用户需要在三种模式（normal/speed/休闲）下练习 IELTS 词汇 |
| **决策** | SPA 单页应用, hash 路由, composeable 组织逻辑, Pinia 管理状态 |
| **为什么不是...** | 非 SSR（静态托管 GitHub Pages）, 非 iframe 嵌入 |
| **设计** | — (Phase 0 初始形态, 无独立设计文档) |
| **模块** | `mod:game-engine`, `mod:word-data`, `mod:audio`, `mod:speech`, `mod:confetti`, `mod:router` |
| **任务** | A-1~A-8 (Phase 0 初始化), E-1, E-2 (Phase 0 提取) |
| **废弃条件** | 项目转型或重构替换 |

## REQ-002: 游戏会话持久化
| 字段 | 值 |
|------|-----|
| **状态** | ✅ done |
| **优先级** | P0 |
| **起源** | ReviewPage 需要获取游戏结果（分数、错词），之前依赖脆弱的 localStorage |
| **决策** | Pinia store (`gameSession`) 在 TypingGame ←→ ReviewPage 间共享 |
| **ADR** | ADR/001-pinia-store.md |
| **设计** | ADR/001-pinia-store.md (设计见 ADR) |
| **模块** | `mod:game-engine` (stores/gameSession.ts), `mod:review` |
| **任务** | R-A-1 (store 集成), R-A-2 (状态收拢), R-A-3 (跨组件直读) |
| **废弃条件** | 引入后端持久化替代 store |

## REQ-003: 主题系统
| 字段 | 值 |
|------|-----|
| **状态** | ✅ done |
| **优先级** | P1 |
| **起源** | 用户需要视觉多样性：夜间模式、INS 风格、可爱风格 |
| **决策** | CSS custom properties + `.theme-*` class toggle。无运行时主题引擎 |
| **为什么不是 CSS-in-JS** | 增加包体积, 3 个静态主题不值得。为什么不是 Tailwind: 全量重构 |
| **设计** | — (Phase 0 提取, 无独立设计文档) |
| **模块** | `mod:theme`, `mod:ui-comps`, `mod:home` |
| **任务** | A-1~A-8 (Phase 0 提取), B-A-1 (CuteDeco Home CSS 修复) |
| **废弃条件** | 主题数 > 5 → 需重新评估运行时方案 |

## REQ-004: 多游戏模式
| 字段 | 值 |
|------|-----|
| **状态** | 🔄 in-progress |
| **优先级** | P1 |
| **起源** | 单一打字模式不够, 增加拼写和听力模式提升可玩性 |
| **决策** | 待定 — 预计 composable-per-mode 模式 |
| **设计** | `designs/REQ-004-game-modes.md` (待创建) |
| **模块** | `mod:game-engine` (新 composables, 模式切换), `mod:speech` (听力) |
| **任务** | F-A-1 (拼写模式), F-A-2 (听力模式) |
| **阻塞** | — |
| **废弃条件** | 模式合一化或被替代 |

## REQ-005: 成就系统
| 字段 | 值 |
|------|-----|
| **状态** | 📋 proposed |
| **优先级** | P2 |
| **起源** | 游戏化：追踪连击成就、解锁视觉奖励, 提升用户粘性 |
| **决策** | 暂定 localStorage 持久化, 解锁时显示通知 |
| **设计** | `designs/REQ-005-achievements.md` (待创建) |
| **模块** | 待定 — 可能新增 `mod:achievements` |
| **任务** | F-B-1 |
| **阻塞** | REQ-004 (需要模式上下文做模式专属成就) |
| **废弃条件** | — |

## REQ-006: 词库管理
| 字段 | 值 |
|------|-----|
| **状态** | 📋 proposed |
| **优先级** | P2 |
| **起源** | 用户需要自定义词库：新增/编辑/删除词条、按话题分类浏览 |
| **设计** | `designs/REQ-006-word-manager.md` (待创建) |
| **模块** | `mod:word-data` (词库读写), 新增管理界面 |
| **任务** | F-C-1 |
| **废弃条件** | — |

## REQ-007: 性能优化
| 字段 | 值 |
|------|-----|
| **状态** | ⏳ pending |
| **优先级** | P1 |
| **起源** | 词库大对象 + 游戏频繁 re-render 导致性能瓶颈 |
| **决策** | 渐进式优化：shallowRef → v-memo → 懒加载 |
| **设计** | — (标准优化手段, 方案见 R/B.md) |
| **模块** | `mod:game-engine` (wordBank, PromptCard, StatsRow, GameFinished) |
| **任务** | R-B-1 (shallowRef), R-B-2 (v-memo), R-B-3 (懒加载) |
| **废弃条件** | 重构成虚拟滚动或 Web Worker |

## REQ-008: 测试覆盖
| 字段 | 值 |
|------|-----|
| **状态** | ⏳ pending |
| **优先级** | P1 |
| **起源** | 核心计分逻辑、计时器、词库功能缺乏自动化验证 |
| **决策** | Vitest 单元测试 + 组件测试, 渐进式 E2E |
| **设计** | — (标准测试方案, 用例见 T/A.md, T/B.md) |
| **模块** | `mod:game-engine` (useScoring, useTimer, useWordProvider, GamePlay) |
| **任务** | T-A-1~T-A-4 (单元), T-B-1 (E2E) |

## REQ-009: Bug 修复
| 字段 | 值 |
|------|-----|
| **状态** | ✅ done (持续) |
| **优先级** | P0 |
| **起源** | CSS scoped 覆盖、组件不显示等运行时缺陷 |
| **设计** | — (根因分析见 B/A.md) |
| **模块** | `mod:theme`, `mod:home` |
| **任务** | B-A-1 (CuteDeco Home 不显示) |

## REQ-010: 通用单词卡片组件
| 字段 | 值 |
|------|-----|
| **状态** | 📋 proposed |
| **优先级** | P0 |
| **起源** | PromptCard (`components/game/`) 目前紧耦合于游戏场景，ReviewPage 和未来页面都需要展示单词卡片但无法复用 |
| **决策** | 待定 — 提取为 `components/common/WordCard.vue`，保留核心展示逻辑，动画和交互通过 props/slots 可配 |
| **为什么不是...** | 非 inline 样式（需要主题变量）、非纯函数式（需交互能力） |
| **设计** | `designs/REQ-010-word-card.md` |
| **模块** | `mod:ui-comps` (WordCard), `mod:game-engine` (消费方) |
| **任务** | R-C-1 |
| **废弃条件** | 被更成熟的组件库替代 |

---

## 索引查询示例

```bash
# 需求 → 所有关联任务
grep -rn 'REQ-001' .sisyphus/plans/ | grep '##.*→' | sed 's/.*## //;s/ →.*//'

# 需求 → 关联模块
grep 'REQ-001' .sisyphus/REQUIREMENTS.md -A 2 | grep '模块' | sed 's/.*模块.*| //'

# 所有进行中的需求
grep -B1 'in-progress' .sisyphus/REQUIREMENTS.md | grep '##'
```
