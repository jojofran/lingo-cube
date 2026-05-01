import type { WordEntry } from '@/types'
export type { WordEntry }

function genPhonetic(w: string): string {
  const word = w.toLowerCase()
  let i = 0, out = ''
  const peek = (n: number) => word[i + n] || ''
  const eat = (n: number) => { i += n; return n }

  while (i < word.length) {
    const c = word[i]
    const n = peek(1), nn = peek(2)

    // Consonant digraphs
    if (c === 's' && n === 'h') { out += 'ʃ'; eat(2); continue }
    if (c === 'c' && n === 'h') { out += 'tʃ'; eat(2); continue }
    if ((c === 't' && n === 'h') || (c === 't' && n === 'i' && 'ou'.includes(nn))) { out += 'θ'; eat(2); continue }
    if (c === 'p' && n === 'h') { out += 'f'; eat(2); continue }
    if (c === 'w' && n === 'h') { out += 'w'; eat(2); continue }
    if (c === 's' && n === 'c' && 'ei'.includes(nn)) { out += 's'; eat(2); continue }
    if (c === 'c' && n === 'k') { out += 'k'; eat(2); continue }
    if (c === 'd' && n === 'g') { out += 'dʒ'; eat(2); continue }
    if (c === 'j') { out += 'dʒ'; eat(1); continue }
    if ((c === 'q') && n === 'u') { out += 'kw'; eat(2); continue }
    if (c === 'x') { out += 'ks'; eat(1); continue }
    if (c === 'y' && (i === 0 || 'aeiou'.includes(word[i - 1]))) { out += 'j'; eat(1); continue }

    // -tion, -sion, -sure, -ture endings
    if (word.slice(i).startsWith('tion') && i + 3 === word.length - 1) { out += 'ʃən'; i = word.length; continue }
    if (word.slice(i).startsWith('sion') && i + 3 === word.length - 1) { out += 'ʒən'; i = word.length; continue }
    if (word.slice(i).startsWith('ture') && i + 3 === word.length - 1) { out += 'tʃər'; i = word.length; continue }
    if (word.slice(i).startsWith('sure') && i + 3 === word.length - 1) { out += 'ʒər'; i = word.length; continue }
    if (word.slice(i).startsWith('cial') || word.slice(i).startsWith('tial')) { out += 'ʃəl'; i += 4; continue }

    // Silent e
    if (c === 'e' && i === word.length - 1 && word.length > 3) { eat(1); continue }

    // Vowels
    if ('aeiou'.includes(c)) {
      // stressed open syllable
      const stressed = i === 0 || word[i - 1] === word[i - 2]
      if (c === 'a') {
        if (n === 'i' || n === 'y') { out += 'eɪ'; eat(2); continue }
        if (n === 'u') { out += 'ɔː'; eat(2); continue }
        if (n === 'r') { out += stressed ? 'ɑː' : 'ər'; eat(2); continue }
        if (n === 'l' && peek(2) === 'l') { out += 'ɔː'; eat(3); continue }
        if (i === word.length - 2 && 'e'.includes(n)) { out += 'eɪ'; eat(2); continue }
        out += stressed && word.length > 3 ? 'æ' : 'ə'; eat(1); continue
      }
      if (c === 'e') {
        if (n === 'a') { out += 'iː'; eat(2); continue }
        if (n === 'i') { out += 'iː'; eat(2); continue }
        if (n === 'e') { out += 'iː'; eat(2); continue }
        if (n === 'u') { out += 'juː'; eat(2); continue }
        if (n === 'r') { out += stressed ? 'ɜː' : 'ər'; eat(2); continue }
        if (n === 'w') { out += 'juː'; eat(2); continue }
        out += stressed && word.length > 3 ? 'ɛ' : 'ɪ'; eat(1); continue
      }
      if (c === 'i') {
        if (n === 'e' && (nn === 'l' || nn === 'd')) { out += 'aɪ'; eat(2); continue }
        if (n === 'r') { out += stressed ? 'ɜː' : 'ər'; eat(2); continue }
        if (n === 'g' && nn === 'h') { out += 'aɪ'; eat(3); continue }
        if (n === 'o' && (nn === 'n' || nn === 'u')) { out += 'aɪ'; eat(2); continue }
        if (n === 'e') { out += 'iː'; eat(2); continue }
        if (i === word.length - 2 && 'e'.includes(n)) { out += 'aɪ'; eat(2); continue }
        out += 'ɪ'; eat(1); continue
      }
      if (c === 'o') {
        if (n === 'i') { out += 'ɔɪ'; eat(2); continue }
        if (n === 'u') { out += stressed ? 'aʊ' : 'ə'; eat(2); continue }
        if (n === 'o') { out += 'uː'; eat(2); continue }
        if (n === 'a') { out += 'ɔː'; eat(2); continue }
        if (n === 'r') { out += stressed ? 'ɔː' : 'ər'; eat(2); continue }
        if (i === word.length - 2 && 'ek'.includes(n)) { out += 'əʊ'; eat(2); continue }
        if (i === word.length - 2 && n === 'n') { out += 'əʊ'; eat(2); continue }
        if (i === word.length - 2 && 'ou'.includes(n)) { out += 'ʌ'; eat(2); continue }
        out += stressed && word.length > 3 ? 'ɒ' : 'ə'; eat(1); continue
      }
      if (c === 'u') {
        if (n === 'i') { out += 'uːɪ'; eat(2); continue }
        if (n === 'r') { out += stressed ? 'ɜː' : 'ər'; eat(2); continue }
        if (i === word.length - 2 && 'e'.includes(n)) { out += 'juː'; eat(2); continue }
        if (i === word.length - 2 && n === 'n') { out += 'ʌ'; eat(2); continue }
        if (n === 'n') { eat(2); continue }
        out += 'ʌ'; eat(1); continue
      }
    }

    // Consonants
    const cmap: Record<string, string> = { 'b': 'b', 'd': 'd', 'f': 'f', 'g': 'ɡ', 'h': 'h', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't', 'v': 'v', 'w': 'w', 'z': 'z', 'c': 'k', 'y': 'ɪ', 'q': 'k' }
    if (cmap[c]) { out += cmap[c]; eat(1); continue }
    // double letters
    if (n === c) { out += cmap[c] || c; eat(2); continue }
    out += c; eat(1)
  }
  return '/' + out + '/'
}

const rawBank: { english: string; chinese: string }[] = [
  { english: 'abandon', chinese: '放弃，抛弃' },
  { english: 'absorb', chinese: '吸收，理解' },
  { english: 'abstract', chinese: '抽象的，摘要' },
  { english: 'abundant', chinese: '丰富的，充裕的' },
  { english: 'access', chinese: '通道，进入，获取' },
  { english: 'accommodate', chinese: '容纳，适应' },
  { english: 'accompany', chinese: '陪伴，伴随' },
  { english: 'accomplish', chinese: '完成，实现' },
  { english: 'accurate', chinese: '精确的，准确的' },
  { english: 'achieve', chinese: '达到，获得' },
  { english: 'acknowledge', chinese: '承认，确认，感谢' },
  { english: 'acquire', chinese: '获得，习得' },
  { english: 'adapt', chinese: '适应，改编' },
  { english: 'adequate', chinese: '充足的，适当的' },
  { english: 'adjust', chinese: '调整，适应' },
  { english: 'administration', chinese: '管理，行政部门' },
  { english: 'admire', chinese: '钦佩，赞赏' },
  { english: 'adopt', chinese: '采用，收养' },
  { english: 'advance', chinese: '前进，进步，提前' },
  { english: 'advantage', chinese: '优势，有利条件' },
  { english: 'adventure', chinese: '冒险，奇遇' },
  { english: 'advertise', chinese: '做广告，宣传' },
  { english: 'affair', chinese: '事务，事件' },
  { english: 'aggressive', chinese: '侵略的，好斗的，积极的' },
  { english: 'allocate', chinese: '分配，拨出' },
  { english: 'alternative', chinese: '替代的，供选择的事物' },
  { english: 'ambiguous', chinese: '模糊的，含糊的' },
  { english: 'ambitious', chinese: '有雄心的，野心勃勃的' },
  { english: 'analyse', chinese: '分析，解析' },
  { english: 'annual', chinese: '年度的，每年的' },
  { english: 'anticipate', chinese: '预期，期望' },
  { english: 'anxiety', chinese: '焦虑，忧虑' },
  { english: 'apparent', chinese: '明显的，表面上的' },
  { english: 'appetite', chinese: '食欲，胃口，欲望' },
  { english: 'appreciate', chinese: '欣赏，感激，领会' },
  { english: 'approach', chinese: '方法，接近' },
  { english: 'appropriate', chinese: '适当的，合适的' },
  { english: 'approximate', chinese: '大约的，近似的' },
  { english: 'arise', chinese: '出现，产生' },
  { english: 'artificial', chinese: '人工的，人造的' },
  { english: 'aspect', chinese: '方面，层面' },
  { english: 'assemble', chinese: '集合，组装' },
  { english: 'assess', chinese: '评估，评定' },
  { english: 'assign', chinese: '分配，委派' },
  { english: 'assist', chinese: '帮助，协助' },
  { english: 'assume', chinese: '假设，承担' },
  { english: 'atmosphere', chinese: '大气层，氛围' },
  { english: 'attach', chinese: '附上，连接，重视' },
  { english: 'attempt', chinese: '尝试，试图' },
  { english: 'attend', chinese: '参加，注意，照顾' },
  { english: 'attitude', chinese: '态度，看法' },
  { english: 'attract', chinese: '吸引，引起' },
  { english: 'authority', chinese: '权威，当局' },
  { english: 'available', chinese: '可用的，可获得的' },
  { english: 'aware', chinese: '意识到的，知道的' },
  { english: 'barrier', chinese: '障碍，屏障' },
  { english: 'behalf', chinese: '代表，为了…的利益' },
  { english: 'behave', chinese: '表现，举止' },
  { english: 'benefit', chinese: '利益，受益' },
  { english: 'boundary', chinese: '边界，界限' },
  { english: 'brilliant', chinese: '杰出的，明亮的' },
  { english: 'budget', chinese: '预算，经费' },
  { english: 'burden', chinese: '负担，重担' },
  { english: 'capable', chinese: '有能力的' },
  { english: 'capacity', chinese: '能力，容量' },
  { english: 'capture', chinese: '捕获，俘获' },
  { english: 'category', chinese: '类别，范畴' },
  { english: 'celebrate', chinese: '庆祝，赞颂' },
  { english: 'challenge', chinese: '挑战，质疑' },
  { english: 'channel', chinese: '频道，渠道，海峡' },
  { english: 'chapter', chinese: '章节，篇章' },
  { english: 'circumstance', chinese: '环境，情况' },
  { english: 'collapse', chinese: '倒塌，崩溃' },
  { english: 'colleague', chinese: '同事，同僚' },
  { english: 'combine', chinese: '结合，联合' },
  { english: 'comment', chinese: '评论，意见' },
  { english: 'commit', chinese: '承诺，犯罪，委托' },
  { english: 'communicate', chinese: '沟通，交流' },
  { english: 'community', chinese: '社区，团体' },
  { english: 'compatible', chinese: '兼容的，合得来的' },
  { english: 'compensate', chinese: '补偿，赔偿' },
  { english: 'compete', chinese: '竞争，比赛' },
  { english: 'competent', chinese: '有能力的，胜任的' },
  { english: 'component', chinese: '组成部分，部件' },
  { english: 'comprehensive', chinese: '全面的，综合的' },
  { english: 'comprise', chinese: '包含，由…组成' },
  { english: 'concentrate', chinese: '集中，专注' },
  { english: 'concept', chinese: '概念，观念' },
  { english: 'conclude', chinese: '总结，得出结论' },
  { english: 'conduct', chinese: '进行，实施，行为' },
  { english: 'conference', chinese: '会议，讨论会' },
  { english: 'confident', chinese: '自信的，有信心的' },
  { english: 'confirm', chinese: '确认，证实' },
  { english: 'conflict', chinese: '冲突，矛盾' },
  { english: 'confront', chinese: '面对，对抗' },
  { english: 'conscious', chinese: '意识到的，有意识的' },
  { english: 'consequence', chinese: '结果，后果' },
  { english: 'conservative', chinese: '保守的，守旧的' },
  { english: 'considerable', chinese: '相当大的，可观的' },
  { english: 'consistent', chinese: '一致的，始终如一的' },
  { english: 'constant', chinese: '持续的，不变的' },
  { english: 'constitute', chinese: '构成，组成' },
  { english: 'construct', chinese: '建造，构建' },
  { english: 'consume', chinese: '消耗，消费' },
  { english: 'contact', chinese: '联系，接触' },
  { english: 'contemporary', chinese: '当代的，同时代的' },
  { english: 'context', chinese: '上下文，背景' },
  { english: 'contract', chinese: '合同，契约，收缩' },
  { english: 'contradict', chinese: '反驳，相矛盾' },
  { english: 'contrast', chinese: '对比，对照' },
  { english: 'contribute', chinese: '贡献，投稿，捐赠' },
  { english: 'controversy', chinese: '争论，争议' },
  { english: 'convenient', chinese: '方便的，便利的' },
  { english: 'convince', chinese: '说服，使确信' },
  { english: 'cooperate', chinese: '合作，协作' },
  { english: 'coordinate', chinese: '协调，搭配' },
  { english: 'corporate', chinese: '公司的，法人的' },
  { english: 'correspond', chinese: '对应，通信' },
  { english: 'crucial', chinese: '关键的，至关重要的' },
  { english: 'currency', chinese: '货币，流通' },
  { english: 'decline', chinese: '下降，衰退，谢绝' },
  { english: 'demonstrate', chinese: '展示，证明，示威' },
  { english: 'depict', chinese: '描绘，描述' },
  { english: 'derive', chinese: '衍生，源自' },
  { english: 'despite', chinese: '尽管，不管' },
  { english: 'detect', chinese: '发现，察觉' },
  { english: 'device', chinese: '设备，装置' },
  { english: 'dimension', chinese: '维度，尺寸' },
  { english: 'diminish', chinese: '减少，削弱' },
  { english: 'discipline', chinese: '纪律，学科' },
  { english: 'display', chinese: '展示，显示' },
  { english: 'distinct', chinese: '明显的，独特的' },
  { english: 'distribute', chinese: '分配，分发' },
  { english: 'diverse', chinese: '多样的，不同的' },
  { english: 'domestic', chinese: '国内的，家庭的' },
  { english: 'dominate', chinese: '主导，支配' },
  { english: 'draft', chinese: '草稿，草案' },
  { english: 'duration', chinese: '持续时间，期限' },
  { english: 'dynamic', chinese: '动态的，充满活力的' },
  { english: 'eliminate', chinese: '消除，淘汰' },
  { english: 'emerge', chinese: '出现，浮现' },
  { english: 'emphasis', chinese: '强调，重点' },
  { english: 'enable', chinese: '使能够，启用' },
  { english: 'encounter', chinese: '遇到，邂逅' },
  { english: 'enhance', chinese: '增强，提高' },
  { english: 'enormous', chinese: '巨大的，庞大的' },
  { english: 'ensure', chinese: '确保，保证' },
  { english: 'enterprise', chinese: '企业，事业，进取心' },
  { english: 'enthusiasm', chinese: '热情，热忱' },
  { english: 'environment', chinese: '环境，周围' },
  { english: 'equip', chinese: '装备，配备' },
  { english: 'equivalent', chinese: '等同的，等价的' },
  { english: 'essential', chinese: '必要的，本质的' },
  { english: 'establish', chinese: '建立，设立' },
  { english: 'evaluate', chinese: '评估，评价' },
  { english: 'eventually', chinese: '最终，终于' },
  { english: 'evidence', chinese: '证据，迹象' },
  { english: 'evolve', chinese: '进化，发展' },
  { english: 'exaggerate', chinese: '夸张，夸大' },
  { english: 'exceed', chinese: '超过，超越' },
  { english: 'exclude', chinese: '排除，不包括' },
  { english: 'exhibit', chinese: '展示，展览' },
  { english: 'expand', chinese: '扩张，扩展' },
  { english: 'expertise', chinese: '专长，专业知识' },
  { english: 'exploit', chinese: '开发，利用，剥削' },
  { english: 'export', chinese: '出口，输出' },
  { english: 'expose', chinese: '暴露，揭露' },
  { english: 'external', chinese: '外部的，外界的' },
  { english: 'extract', chinese: '提取，摘录' },
  { english: 'facilitate', chinese: '促进，使便利' },
  { english: 'factor', chinese: '因素，要素' },
  { english: 'feature', chinese: '特征，特色' },
  { english: 'flexible', chinese: '灵活的，可变通的' },
  { english: 'fluctuate', chinese: '波动，起伏' },
  { english: 'foundation', chinese: '基础，基金会' },
  { english: 'framework', chinese: '框架，结构' },
  { english: 'function', chinese: '功能，作用，函数' },
  { english: 'fundamental', chinese: '基本的，根本的' },
  { english: 'generate', chinese: '产生，生成' },
  { english: 'gradual', chinese: '逐渐的，渐进的' },
  { english: 'guarantee', chinese: '保证，担保' },
  { english: 'guideline', chinese: '指导方针，准则' },
  { english: 'highlight', chinese: '强调，突出显示' },
  { english: 'hypothesis', chinese: '假设，假说' },
  { english: 'identical', chinese: '相同的，同一的' },
  { english: 'identify', chinese: '识别，确认' },
  { english: 'illustrate', chinese: '阐明，（用图）说明' },
  { english: 'impact', chinese: '影响，冲击' },
  { english: 'implement', chinese: '实施，执行' },
  { english: 'implication', chinese: '含意，暗示，影响' },
  { english: 'impose', chinese: '强加，征收' },
  { english: 'incentive', chinese: '激励，刺激' },
  { english: 'incorporate', chinese: '合并，纳入' },
  { english: 'indicate', chinese: '表明，指示' },
  { english: 'inevitable', chinese: '不可避免的' },
  { english: 'infrastructure', chinese: '基础设施' },
  { english: 'inherent', chinese: '固有的，内在的' },
  { english: 'initial', chinese: '最初的，开始的' },
  { english: 'initiative', chinese: '主动性，倡议' },
  { english: 'innovation', chinese: '创新，革新' },
  { english: 'insight', chinese: '洞察力，见解' },
  { english: 'integrate', chinese: '整合，融入' },
  { english: 'integrity', chinese: '正直，完整' },
  { english: 'intellectual', chinese: '智力的，知识分子' },
  { english: 'intelligence', chinese: '智力，情报' },
  { english: 'intense', chinese: '强烈的，紧张的' },
  { english: 'interact', chinese: '互动，相互作用' },
  { english: 'interpret', chinese: '解释，口译' },
  { english: 'intervene', chinese: '干预，介入' },
  { english: 'invest', chinese: '投资，投入' },
  { english: 'involve', chinese: '涉及，包含，使参与' },
  { english: 'isolate', chinese: '孤立，隔离' },
  { english: 'justify', chinese: '证明…正当，为…辩护' },
  { english: 'maintain', chinese: '保持，维持，保养' },
  { english: 'majority', chinese: '大多数，大部分' },
  { english: 'manipulate', chinese: '操纵，操作' },
  { english: 'mechanism', chinese: '机制，机械装置' },
  { english: 'minimise', chinese: '最小化，降到最低' },
  { english: 'monitor', chinese: '监视器，监测' },
  { english: 'motive', chinese: '动机，目的' },
  { english: 'mutual', chinese: '互相的，共同的' },
  { english: 'negotiate', chinese: '谈判，协商' },
  { english: 'nevertheless', chinese: '然而，尽管如此' },
  { english: 'objective', chinese: '目标，客观的' },
  { english: 'obtain', chinese: '获得，得到' },
  { english: 'obvious', chinese: '明显的，显然的' },
  { english: 'occupation', chinese: '职业，占用' },
  { english: 'occur', chinese: '发生，出现' },
  { english: 'ongoing', chinese: '进行中的，持续的' },
  { english: 'outcome', chinese: '结果，成果' },
  { english: 'overall', chinese: '总体的，全面的' },
  { english: 'participate', chinese: '参与，参加' },
  { english: 'perceive', chinese: '察觉，理解，认为' },
  { english: 'persist', chinese: '坚持，持续存在' },
  { english: 'perspective', chinese: '观点，视角' },
  { english: 'phenomenon', chinese: '现象，奇观' },
  { english: 'potential', chinese: '潜力，潜在的' },
  { english: 'predict', chinese: '预测，预言' },
  { english: 'preliminary', chinese: '初步的，预备的' },
  { english: 'preserve', chinese: '保存，保护' },
  { english: 'previous', chinese: '之前的，先前的' },
  { english: 'principle', chinese: '原则，原理' },
  { english: 'priority', chinese: '优先，优先级' },
  { english: 'procedure', chinese: '程序，步骤' },
  { english: 'professional', chinese: '专业的，职业的' },
  { english: 'prohibit', chinese: '禁止，阻止' },
  { english: 'promote', chinese: '促进，推销，晋升' },
  { english: 'proportion', chinese: '比例，部分' },
  { english: 'prospect', chinese: '前景，展望' },
  { english: 'purchase', chinese: '购买，购置' },
  { english: 'pursue', chinese: '追求，追赶' },
  { english: 'random', chinese: '随机的，任意的' },
  { english: 'recover', chinese: '恢复，康复' },
  { english: 'refine', chinese: '精炼，改进' },
  { english: 'regulate', chinese: '调节，管理' },
  { english: 'reinforce', chinese: '加强，增援' },
  { english: 'reject', chinese: '拒绝，驳回' },
  { english: 'release', chinese: '释放，发布' },
  { english: 'relevant', chinese: '相关的，切题的' },
  { english: 'reluctant', chinese: '不情愿的，勉强的' },
  { english: 'rely', chinese: '依赖，依靠' },
  { english: 'remove', chinese: '移除，消除' },
  { english: 'resolve', chinese: '解决，决心' },
  { english: 'resource', chinese: '资源，物力' },
  { english: 'respond', chinese: '回应，响应' },
  { english: 'restrict', chinese: '限制，约束' },
  { english: 'reveal', chinese: '揭示，透露' },
  { english: 'revenue', chinese: '收入，税收' },
  { english: 'revolution', chinese: '革命，变革' },
  { english: 'scenario', chinese: '情景，方案' },
  { english: 'schedule', chinese: '时间表，计划' },
  { english: 'secure', chinese: '安全的，保护' },
  { english: 'significant', chinese: '重要的，有意义的' },
  { english: 'simulate', chinese: '模拟，仿真' },
  { english: 'specific', chinese: '具体的，特定的' },
  { english: 'stability', chinese: '稳定性，稳固' },
  { english: 'strategy', chinese: '策略，战略' },
  { english: 'sufficient', chinese: '足够的，充分的' },
  { english: 'sustain', chinese: '维持，支撑' },
  { english: 'temporary', chinese: '暂时的，临时的' },
  { english: 'terminate', chinese: '终止，结束' },
  { english: 'transform', chinese: '转变，改造' },
  { english: 'transition', chinese: '过渡，转变' },
  { english: 'ultimate', chinese: '最终的，根本的' },
  { english: 'undergo', chinese: '经历，承受' },
  { english: 'undertake', chinese: '承担，从事' },
  { english: 'uniform', chinese: '统一的，制服' },
  { english: 'unique', chinese: '独特的，独一无二的' },
  { english: 'valid', chinese: '有效的，合理的' },
  { english: 'variable', chinese: '变量，可变的' },
  { english: 'verify', chinese: '验证，核实' },
  { english: 'versatile', chinese: '多才多艺的，多功能的' },
  { english: 'visible', chinese: '可见的，明显的' },
  { english: 'welfare', chinese: '福利，幸福' },
  { english: 'widespread', chinese: '广泛的，普遍的' },
  { english: 'withdraw', chinese: '撤回，提取，退出' },
  { english: 'yield', chinese: '产出，屈服' },
]

export const wordBank: WordEntry[] = rawBank.map(w => ({
  ...w,
  phonetic: genPhonetic(w.english),
}))

export function shuffleWords(arr: WordEntry[]): WordEntry[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function pickRandom(arr: WordEntry[], count: number): WordEntry[] {
  return shuffleWords(arr).slice(0, count)
}
