# 组件索引

> 总表：按分类列出所有组件和 composable。详情见对应分类文件。

| ID | 组件 | 分类 | 作用 | 文件 | 状态 |
|----|------|------|------|------|------|
| | **Components** | | | | |
| C-common-1 | WordCard | common | 基础单词卡片，显示中/英文+音标+TTS | components/C-common.md | stable |
| C-common-2 | WordCardEx | common | WordCard + 例句区+例句喇叭 | components/C-common.md | stable |
| C-common-3 | ReviewCard | common | WordCardEx 英文主词版，固定 primary=english | components/C-common.md | stable |
| C-common-4 | BackButton | common | 固定定位的返回按钮（箭头图标） | components/C-common.md | stable |
| C-common-5 | ThemeToggle | common | 固定定位的主题切换按钮（dark/ins/cute循环） | components/C-common.md | stable |
| C-common-6 | AchievementToast | common | 成就解锁通知弹窗（自动消失） | components/C-common.md | stable |
| C-common-7 | CuteDeco | common | Cute 主题 SVG 手绘装饰（所有页面必须加） | components/C-common.md | stable |
| C-common-8 | WordList | common | 单词列表容器（统一背景/边框/悬停，支持action插槽） | components/C-common.md | stable |
| C-game-1 | ModeSelect | game | 主界面模式选择（normal/speed/spell/listen） | components/C-game.md | stable |
| C-game-2 | GamePlay | game | 游戏主界面 orchestrator，组合子组件 | components/C-game.md | stable |
| C-game-3 | StatsRow | game | 三格统计条（得分/连击/轮次） | components/C-game.md | stable |
| C-game-4 | TimerRing | game | SVG 圆形倒计时，speed模式专用 | components/C-game.md | stable |
| C-game-5 | InputArea | game | 打字输入框+确认按钮 | components/C-game.md | stable |
| C-game-6 | ResultBar | game | 正确/错误结果动画条 | components/C-game.md | stable |
| C-game-7 | ProgressDots | game | 圆点进度指示器（绿/蓝/红三色） | components/C-game.md | stable |
| C-game-8 | GameFinished | game | 结束画面：统计+错词列表+重玩/复习按钮 | components/C-game.md | stable |
| C-word-1 | WordSpeaker | word | TTS 喇叭按钮（SVG图标+脉冲动画） | components/C-word.md | stable |
| C-word-2 | WordListItem | word | 紧凑单行：[🔊]中文 音标 英文 | components/C-word.md | stable |
| C-review-1 | ReviewSessionCard | review | 复习会话：Got it/Vocab翻卡+进度+导航 | components/C-review.md | stable |
| | **Composables** | | | | |
| C-comp-1 | useSpeech | composable | TTS语音合成（speak/cancel+状态） | components/C-composable.md | stable |
| C-comp-2 | useTheme | composable | 全局主题单例（dark/ins/cute循环） | components/C-composable.md | stable |
| C-comp-3 | useAudio | composable | 音效播放（AudioContext管理） | components/C-composable.md | stable |
| C-comp-4 | useTimer | composable | 倒计时（start/stop+timeLeft） | components/C-composable.md | stable |
| C-comp-5 | useConfetti | composable | Canvas彩纸庆祝动画 | components/C-composable.md | stable |
| C-comp-6 | useWordProvider | composable | 词库获取（API优先→local fallback） | components/C-composable.md | stable |
| C-comp-7 | useVocabBook | composable | 生词本CRUD（localStorage） | components/C-composable.md | stable |
| C-comp-8 | useAchievements | composable | 成就系统（定义/解锁/存储/通知） | components/C-composable.md | stable |
