# Module Map

模块定义、边界、依赖关系。按前端/后端分组。

---

## Frontend

### mod:game-engine
| 字段 | 值 |
|------|-----|
| **用途** | 打字练习核心逻辑：游戏循环、计分、combo、模式切换、词条流转 |
| **文件** | `views/TypingGame.vue`, `stores/gameSession.ts`, `components/game/` (全部) |
| **Composables** | `useScoring`, `useTimer`, `useWordProvider` |
| **类型** | `types/game.ts` |
| **依赖** | `mod:audio`, `mod:speech`, `mod:word-data`, `mod:confetti`, `mod:theme` |
| **被依赖** | `mod:review` (读取 gameSession) |
| **状态** | active |
| **演进** | R-A-1 (Pinia store 集成), R-A-2 (状态收拢), R-A-3 (跨组件共享) |
| **关联需求** | REQ-001, REQ-002, REQ-004, REQ-007, REQ-008 |

### mod:word-data
| 字段 | 值 |
|------|-----|
| **用途** | 词库：IELTS 词汇数据、API 客户端、音标生成、随机选取 |
| **文件** | `views/wordBank.ts`, `api/word.ts`, `types/word.ts` |
| **依赖** | 后端 `lingo_cube_server/` (可选, fallback 到本地词库) |
| **状态** | active |
| **演进** | Phase 0 (类型提取), F-C-1 (词库管理界面) |
| **关联需求** | REQ-001, REQ-006 |

### mod:theme
| 字段 | 值 |
|------|-----|
| **用途** | 视觉主题系统：暗色/INS/可爱三套主题, CSS 变量 |
| **文件** | `style.css`, `composables/useTheme.ts`, `components/CuteDeco.vue`, `components/common/ThemeToggle.vue` |
| **被依赖** | 所有视图/组件（消费 CSS 变量） |
| **状态** | active |
| **演进** | Phase 2 (从 TypingGame 提取 token), B-A-1 (Home 修复) |
| **关联需求** | REQ-003 |

### mod:ui-comps
| 字段 | 值 |
|------|-----|
| **用途** | 可复用的 UI 组件：布局、按钮、装饰 |
| **文件** | `components/common/BackButton.vue`, `components/common/ThemeToggle.vue` (共享), `components/CuteDeco.vue` |
| **状态** | active |
| **关联需求** | REQ-003 |

### mod:home
| 字段 | 值 |
|------|-----|
| **用途** | 首页入口：装饰、导航到游戏或其他页面 |
| **文件** | `views/Home.vue` |
| **状态** | active |
| **演进** | B-A-1 (CuteDeco 显示修复) |
| **关联需求** | REQ-003 |

### mod:review
| 字段 | 值 |
|------|-----|
| **用途** | 游戏结果回顾：成绩展示、错词复习 |
| **文件** | `views/ReviewPage.vue` |
| **依赖** | `mod:game-engine` (读取 gameSession) |
| **状态** | active |
| **演进** | R-A-3 (store 直读, 替代 localStorage) |
| **关联需求** | REQ-002 |

### mod:audio
| 字段 | 值 |
|------|-----|
| **用途** | 音效播放：正确/错误/完成音效, AudioContext 管理 |
| **文件** | `composables/useAudio.ts`, `assets/audio/` |
| **被依赖** | `mod:game-engine` |
| **状态** | stable |
| **关联需求** | REQ-001 |

### mod:speech
| 字段 | 值 |
|------|-----|
| **用途** | TTS 语音合成：Web Speech API, 单词朗读 |
| **文件** | `composables/useSpeech.ts` |
| **被依赖** | `mod:game-engine`, `mod:review` |
| **状态** | stable |
| **演进** | F-A-2 (听力模式) |
| **关联需求** | REQ-004 |

### mod:confetti
| 字段 | 值 |
|------|-----|
| **用途** | Canvas 彩纸动画：正确/完成时庆祝效果 |
| **文件** | `composables/useConfetti.ts` |
| **被依赖** | `mod:game-engine` |
| **状态** | stable |
| **关联需求** | REQ-001 |

### mod:router
| 字段 | 值 |
|------|-----|
| **用途** | 路由配置：hash 模式, 页面跳转 |
| **文件** | `router/index.ts`, `main.ts` (部分) |
| **状态** | stable |

---

## Backend

### backend:word-api
| 字段 | 值 |
|------|-----|
| **用途** | 词库 API 服务：全量/随机/详情 |
| **文件** | `lingo_cube_server/` |
| **状态** | stable |
| **依赖** | — |
| **被依赖** | `mod:word-data` (可选) |
| **关联需求** | REQ-001 |

---

## 索引查询示例

```bash
# 模块 → 所有关联任务 (模块在标题下1行, 需求在标题下2行, 统一 -B2)
grep -rn 'mod:game-engine' .sisyphus/plans/ -B2 | grep '##'

# 需求 → 所有关联任务
grep -rn 'REQ-002' .sisyphus/plans/ -B2 | grep '##'

# 模块 → 关联需求 (从 MODULES.md 查)
grep 'mod:game-engine' .sisyphus/MODULES.md | grep '关联需求'

# 需求 → 关联模块 (从 REQUIREMENTS.md 查)
grep 'REQ-001' .sisyphus/REQUIREMENTS.md -A 2 | grep '模块'
```
