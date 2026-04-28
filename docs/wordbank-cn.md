# 词库模块设计文档

## 概述

词库模块是一个独立的词汇数据库，包含297个IELTS词汇，支持自动生成的音标转写。它为打字练习游戏提供核心数据支持。

## 模块结构

```
lingo_cube_web/src/
└── views/
    └── wordBank.ts      # 词汇数据模型、音标生成器、工具函数
```

## 数据结构

### WordEntry 接口
```typescript
interface WordEntry {
  english: string        // 英语单词（必需）
  chinese: string       // 中文翻译（必需）
  phonetic: string     # 音标（自动生成）
  examples?: {        # 例句（可选）
    text: string      # 例句文本
    weight: number    # 难度权重
  }[]
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| english | string | 主键 - 需要拼写的单词 |
| chinese | string | 中文含义/翻译，作为提示 |
| phonetic | string | IPA音标（通过genPhonetic()自动生成） |
| examples | array | 可选的用法示例及难度权重 |

## 音标生成算法

### genPhonetic(w: string): string

音标生成器将英语单词转换为IPA（国际音标）转写。

### 辅音组合
| 输入 | 输出 | 描述 |
|------|------|------|
| sh  | ʃ | 舌叶擦音 |
| ch  | tʃ | 舌叶破擦音 |
| th  | θ | 齿擦音 |
| ph  | f | 摩擦音 |
| ck  | k | 塞音 |
| dg  | dʒ | 舌叶浊破擦音 |
| j   | dʒ | 舌叶浊破擦音 |

### 特殊词尾
| 模式 | 输出 | 条件 |
|--------|--------|----------|
| -tion | ʃən | 单词末尾 |
| -sion | ʒən | 单词末尾 |
| -ture | tʃər | 单词末尾 |
| -sure | ʒər | 单词末尾 |
| -cial | ʃəl | 任何位置 |
| -tial | ʃəl | 任何位置 |

### 元音模式
| 字母 | 上下文 | 输出 |
|------|---------|--------|
| a | +i/y | eɪ（如"make"） |
| a | +u | ɔː（如"cause"） |
| a | +r | ɑː 或 ər |
| e | 任意 | ɛ 或 ɪ |
| i | +e | aɪ（如"time"） |
| o | +i | ɔɪ（如"boy"） |
| o | +u | aʊ（如"now"） |

### 静音字母
- 词尾静音e（例如："make" → /meɪk/）

## 词库内容

### 统计信息
- **总词汇量**: 297个
- **分类**: IELTS学术词汇
- **难度**: 中级至高级（B2-C1）
- **覆盖率**: 常见高频学术词汇

### 示例词汇
| English | Chinese | Phonetic |
|---------|---------|---------|
| abandon | 放弃，抛弃 | /əˈbændən/ |
| absorb | 吸收，理解 | /əbˈsɔːb/ |
| abstract | 抽象的，摘要 | /ˈæbstrækt/ |
| abundant | 丰富的，充裕的 | /əˈbʌndənt/ |
| access | 通道，进入，获取 | /ˈækses/ |
| accomplish | 完成实现 | /əˈkʌmplɪʃ/ |
| accurate | 精确的，准确的 | /ˈækjərət/ |
| achieve | 达到，获得 | /əˈtʃiːv/ |
| acknowledge | 承认，确认，感谢 | /əkˈnɒlɪdʒ/ |
| acquire | 获得，习得 | /əˈkwaɪə/ |

## 工具函数

### shuffleWords(arr: WordEntry[]): WordEntry[]
Fisher-Yates洗牌算法，随机打乱词汇顺序。

```typescript
export function shuffleWords(arr: WordEntry[]): WordEntry[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

### pickRandom(arr: WordEntry[], count: number): WordEntry[]
返回随机词汇子集。

```typescript
export function pickRandom(arr: WordEntry[], count: number): WordEntry[] {
  return shuffleWords(arr).slice(0, count)
}
```

## API集成

### 词库API（后端）
| 端点 | 方法 | 描述 |
|---------|--------|-------------|
| /api/words | GET | 获取所有词汇 |
| /api/words/random?count=n | GET | 获取n个随机词汇 |
| /api/words/:english | GET | 获取指定词汇 |

### 前端API客户端
```typescript
// api/word.ts
async function fetchRandomWords(count: number): Promise<WordEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/words/random?count=${count}`, { 
      signal: AbortSignal.timeout(5000) 
    })
    return (await res.json()).data.words
  } catch {
    // 回退到本地词库
    return pickRandom(wordBank, count)
  }
}
```

### 回退策略
1. **主数据源**: 远程API（5秒超时）
2. **回退**: 本地wordBank数组
3. **缓存**: localStorage['lingo_words']（可选增强）

## 数据流

```
wordBank.ts (数据源)
    │
    ▼
pickRandom/shuffleWords (选择词汇)
    │
    ▼
TypingGame.vue (游戏组件)
    │
    ▼
游戏回合 (20轮)
```

## 扩展点

### 1. 难度标记
添加难度级别字段用于筛选：
```typescript
interface WordEntry {
  level: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}
```

### 2. 发音音频
添加音频URL：
```typescript
interface WordEntry {
  audioUrl?: string  # MP3发音URL
}
```

### 3. 分类排序
添加分类字段：
```typescript
interface WordEntry {
  category: 'academic' | 'business' | 'technology' | 'general'
}
```

### 4. 词汇频率
添加频率数据以便更好地平衡难度：
```typescript
interface WordEntry {
  frequency: number  # 1-100比例
}
```

## 性能考虑

### 当前实现
- **加载时间**: 297个词汇即时加载
- **音标生成**: 初始化时计算（惰性）
- **内存**: 最小（约50KB）
- **搜索**: O(n)线性扫描

### 优化选项（如需要）
1. **虚拟滚动**: 1000+词汇时
2. **Web Worker**: 音标计算卸载
3. **索引**: 添加哈希表实现O(1)查找
4. **缓存**: 在localStorage中缓存生成的音标

## 错误处理

### 音标生成边缘情况
- 未知字符 → 按原样传递
- 空输入 → 返回 //
- 超长单词（>20字符）: 可能有精度问题

### 数据验证
```typescript
function validateWord(word: WordEntry): boolean {
  return !!word.english && 
         !!word.chinese && 
         word.english.length > 0 &&
         word.english.length < 20
}
```

## 测试清单

- [x] 所有297个词汇有有效的english/chinese
- [x] 所有词汇有自动生成的音标
- [x] 音标格式: /IPA/（带斜杠）
- [x] 洗牌产生随机顺序
- [x] pickRandom返回正确数量
- [x] 无重复词汇
- [x] 无空字段

## 维护说明

### 添加新词汇
1. 按字母顺序添加到rawBank数组
2. 确保english为小写
3. 包含中文翻译（多个含义用逗号分隔）
4. 运行构建以验证音标生成

### 更新音标
genPhonetic()函数基于启发式，可能偶尔产生不准确的发音。生产环境建议：
1. 为常见异常维护手动覆盖字典
2. 或集成发音API

## 相关文件

| 文件 | 用途 |
|------|---------|
| src/views/wordBank.ts | 词汇数据与工具 |
| src/api/word.ts | 带回退的API客户端 |
| src/views/TypingGame.vue | 词汇消费者 |
| lingo_cube_server/service/wordbank.go | 后端词库服务 |

## 提交历史
- feat: 添加200+ IELTS词汇及音标 - 初始词库
- fix: 修正音标生成 - IPA改进
- feat: 添加词库API端点 - 后端集成