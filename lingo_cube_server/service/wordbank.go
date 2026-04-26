package service

import (
	"math/rand"
	"strings"
	"time"

	"lingo_cube_server/model"
)

func genPhonetic(w string) string {
	word := strings.ToLower(w)
	var out strings.Builder
	i := 0

	peek := func(n int) byte {
		if i+n < len(word) {
			return word[i+n]
		}
		return 0
	}

	for i < len(word) {
		c := word[i]
		n := peek(1)
		nn := peek(2)

		// Consonant digraphs
		if c == 's' && n == 'h' { out.WriteString("ʃ"); i += 2; continue }
		if c == 'c' && n == 'h' { out.WriteString("tʃ"); i += 2; continue }
		if (c == 't' && n == 'h') || (c == 't' && n == 'i' && (nn == 'o' || nn == 'u')) { out.WriteString("θ"); i += 2; continue }
		if c == 'p' && n == 'h' { out.WriteString("f"); i += 2; continue }
		if c == 's' && n == 'c' && (nn == 'e' || nn == 'i') { out.WriteString("s"); i += 2; continue }
		if c == 'c' && n == 'k' { out.WriteString("k"); i += 2; continue }
		if c == 'd' && n == 'g' { out.WriteString("dʒ"); i += 2; continue }
		if c == 'j' { out.WriteString("dʒ"); i += 1; continue }
		if c == 'q' && n == 'u' { out.WriteString("kw"); i += 2; continue }
		if c == 'x' { out.WriteString("ks"); i += 1; continue }
		if c == 'y' && (i == 0 || strings.ContainsRune("aeiou", rune(word[i-1]))) { out.WriteString("j"); i += 1; continue }

		// -tion, -sion, -ture, -sure endings
		if strings.HasSuffix(word, "tion") && i == len(word)-4 { out.WriteString("ʃən"); i = len(word); continue }
		if strings.HasSuffix(word, "sion") && i == len(word)-4 { out.WriteString("ʒən"); i = len(word); continue }
		if strings.HasSuffix(word, "ture") && i == len(word)-4 { out.WriteString("tʃər"); i = len(word); continue }
		if strings.HasSuffix(word, "sure") && i == len(word)-4 { out.WriteString("ʒər"); i = len(word); continue }
		if strings.HasPrefix(word[i:], "cial") || strings.HasPrefix(word[i:], "tial") { out.WriteString("ʃəl"); i += 4; continue }

		// Silent e
		if c == 'e' && i == len(word)-1 && len(word) > 3 { i += 1; continue }

		// Vowels
		if strings.ContainsRune("aeiou", rune(c)) {
			stressed := i == 0 || (i > 1 && word[i-1] == word[i-2])
			switch c {
			case 'a':
				if n == 'i' || n == 'y' { out.WriteString("eɪ"); i += 2; continue }
				if n == 'u' { out.WriteString("ɔː"); i += 2; continue }
				if n == 'r' {
					if stressed { out.WriteString("ɑː") } else { out.WriteString("ər") }
					i += 2; continue
				}
				if n == 'l' && nn == 'l' { out.WriteString("ɔː"); i += 3; continue }
				if i == len(word)-2 && n == 'e' { out.WriteString("eɪ"); i += 2; continue }
				if stressed && len(word) > 3 { out.WriteString("æ") } else { out.WriteString("ə") }
				i += 1; continue
			case 'e':
				if n == 'a' || n == 'i' || n == 'e' { out.WriteString("iː"); i += 2; continue }
				if n == 'u' { out.WriteString("juː"); i += 2; continue }
				if n == 'r' {
					if stressed { out.WriteString("ɜː") } else { out.WriteString("ər") }
					i += 2; continue
				}
				if n == 'w' { out.WriteString("juː"); i += 2; continue }
				if stressed && len(word) > 3 { out.WriteString("ɛ") } else { out.WriteString("ɪ") }
				i += 1; continue
			case 'i':
				if n == 'e' && (nn == 'l' || nn == 'd') { out.WriteString("aɪ"); i += 2; continue }
				if n == 'r' {
					if stressed { out.WriteString("ɜː") } else { out.WriteString("ər") }
					i += 2; continue
				}
				if n == 'g' && nn == 'h' { out.WriteString("aɪ"); i += 3; continue }
				if n == 'o' && (nn == 'n' || nn == 'u') { out.WriteString("aɪ"); i += 2; continue }
				if n == 'e' { out.WriteString("iː"); i += 2; continue }
				if i == len(word)-2 && n == 'e' { out.WriteString("aɪ"); i += 2; continue }
				out.WriteString("ɪ"); i += 1; continue
			case 'o':
				if n == 'i' { out.WriteString("ɔɪ"); i += 2; continue }
				if n == 'u' {
					if stressed { out.WriteString("aʊ") } else { out.WriteString("ə") }
					i += 2; continue
				}
				if n == 'o' { out.WriteString("uː"); i += 2; continue }
				if n == 'a' { out.WriteString("ɔː"); i += 2; continue }
				if n == 'r' {
					if stressed { out.WriteString("ɔː") } else { out.WriteString("ər") }
					i += 2; continue
				}
				if i == len(word)-2 && (n == 'e' || n == 'k') { out.WriteString("əʊ"); i += 2; continue }
				if i == len(word)-2 && n == 'n' { out.WriteString("əʊ"); i += 2; continue }
				if stressed && len(word) > 3 { out.WriteString("ɒ") } else { out.WriteString("ə") }
				i += 1; continue
			case 'u':
				if n == 'i' { out.WriteString("uːɪ"); i += 2; continue }
				if n == 'r' {
					if stressed { out.WriteString("ɜː") } else { out.WriteString("ər") }
					i += 2; continue
				}
				if i == len(word)-2 && n == 'e' { out.WriteString("juː"); i += 2; continue }
				out.WriteString("ʌ"); i += 1; continue
			}
		}

		// Consonants
		cmap := map[byte]string{'b': "b", 'd': "d", 'f': "f", 'g': "ɡ", 'h': "h", 'k': "k", 'l': "l", 'm': "m", 'n': "n", 'p': "p", 'r': "r", 's': "s", 't': "t", 'v': "v", 'w': "w", 'z': "z", 'c': "k", 'y': "ɪ", 'q': "k"}
		if val, ok := cmap[c]; ok { out.WriteString(val); i += 1; continue }
		if n == c { out.WriteString(string(c)); i += 2; continue } // double letters
		out.WriteString(string(c)); i += 1
	}

	return "/" + out.String() + "/"
}

// genWord creates a Word with auto-generated phonetic
func genWord(english, chinese string) model.Word {
	return model.Word{
		English:  english,
		Chinese:  chinese,
		Phonetic: genPhonetic(english),
	}
}

var wordBank = []model.Word{
	genWord("abandon", "放弃，抛弃"),
	genWord("absorb", "吸收，理解"),
	genWord("abstract", "抽象的，摘要"),
	genWord("abundant", "丰富的，充裕的"),
	genWord("access", "通道，进入，获取"),
	genWord("accommodate", "容纳，适应"),
	genWord("accompany", "陪伴，伴随"),
	genWord("accomplish", "完成，实现"),
	genWord("accurate", "精确的，准确的"),
	genWord("achieve", "达到，获得"),
	genWord("acknowledge", "承认，确认，感谢"),
	genWord("acquire", "获得，习得"),
	genWord("adapt", "适应，改编"),
	genWord("adequate", "充足的，适当的"),
	genWord("adjust", "调整，适应"),
	genWord("administration", "管理，行政部门"),
	genWord("admire", "钦佩，赞赏"),
	genWord("adopt", "采用，收养"),
	genWord("advance", "前进，进步，提前"),
	genWord("advantage", "优势，有利条件"),
	genWord("adventure", "冒险，奇遇"),
	genWord("advertise", "做广告，宣传"),
	genWord("affair", "事务，事件"),
	genWord("aggressive", "侵略的，好斗的，积极的"),
	genWord("allocate", "分配，拨出"),
	genWord("alternative", "替代的，供选择的事物"),
	genWord("ambiguous", "模糊的，含糊的"),
	genWord("ambitious", "有雄心的，野心勃勃的"),
	genWord("analyse", "分析，解析"),
	genWord("annual", "年度的，每年的"),
	genWord("anticipate", "预期，期望"),
	genWord("anxiety", "焦虑，忧虑"),
	genWord("apparent", "明显的，表面上的"),
	genWord("appetite", "食欲，胃口，欲望"),
	genWord("appreciate", "欣赏，感激，领会"),
	genWord("approach", "方法，接近"),
	genWord("appropriate", "适当的，合适的"),
	genWord("approximate", "大约的，近似的"),
	genWord("arise", "出现，产生"),
	genWord("artificial", "人工的，人造的"),
	genWord("aspect", "方面，层面"),
	genWord("assemble", "集合，组装"),
	genWord("assess", "评估，评定"),
	genWord("assign", "分配，委派"),
	genWord("assist", "帮助，协助"),
	genWord("assume", "假设，承担"),
	genWord("atmosphere", "大气层，氛围"),
	genWord("attach", "附上，连接，重视"),
	genWord("attempt", "尝试，试图"),
	genWord("attend", "参加，注意，照顾"),
	genWord("attitude", "态度，看法"),
	genWord("attract", "吸引，引起"),
	genWord("authority", "权威，当局"),
	genWord("available", "可用的，可获得的"),
	genWord("aware", "意识到的，知道的"),
	genWord("barrier", "障碍，屏障"),
	genWord("behalf", "代表，为了…的利益"),
	genWord("behave", "表现，举止"),
	genWord("benefit", "利益，受益"),
	genWord("boundary", "边界，界限"),
	genWord("brilliant", "杰出的，明亮的"),
	genWord("budget", "预算，经费"),
	genWord("burden", "负担，重担"),
	genWord("capable", "有能力的"),
	genWord("capacity", "能力，容量"),
	genWord("capture", "捕获，俘获"),
	genWord("category", "类别，范畴"),
	genWord("celebrate", "庆祝，赞颂"),
	genWord("challenge", "挑战，质疑"),
	genWord("channel", "频道，渠道，海峡"),
	genWord("chapter", "章节，篇章"),
	genWord("circumstance", "环境，情况"),
	genWord("collapse", "倒塌，崩溃"),
	genWord("colleague", "同事，同僚"),
	genWord("combine", "结合，联合"),
	genWord("comment", "评论，意见"),
	genWord("commit", "承诺，犯罪，委托"),
	genWord("communicate", "沟通，交流"),
	genWord("community", "社区，团体"),
	genWord("compatible", "兼容的，合得来的"),
	genWord("compensate", "补偿，赔偿"),
	genWord("compete", "竞争，比赛"),
	genWord("competent", "有能力的，胜任的"),
	genWord("component", "组成部分，部件"),
	genWord("comprehensive", "全面的，综合的"),
	genWord("comprise", "包含，由…组成"),
	genWord("concentrate", "集中，专注"),
	genWord("concept", "概念，观念"),
	genWord("conclude", "总结，得出结论"),
	genWord("conduct", "进行，实施，行为"),
	genWord("conference", "会议，讨论会"),
	genWord("confident", "自信的，有信心的"),
	genWord("confirm", "确认，证实"),
	genWord("conflict", "冲突，矛盾"),
	genWord("confront", "面对，对抗"),
	genWord("conscious", "意识到的，有意识的"),
	genWord("consequence", "结果，后果"),
	genWord("conservative", "保守的，守旧的"),
	genWord("considerable", "相当大的，可观的"),
	genWord("consistent", "一致的，始终如一的"),
	genWord("constant", "持续的，不变的"),
	genWord("constitute", "构成，组成"),
	genWord("construct", "建造，构建"),
	genWord("consume", "消耗，消费"),
	genWord("contact", "联系，接触"),
	genWord("contemporary", "当代的，同时代的"),
	genWord("context", "上下文，背景"),
	genWord("contract", "合同，契约，收缩"),
	genWord("contradict", "反驳，相矛盾"),
	genWord("contrast", "对比，对照"),
	genWord("contribute", "贡献，投稿，捐赠"),
	genWord("controversy", "争论，争议"),
	genWord("convenient", "方便的，便利的"),
	genWord("convince", "说服，使确信"),
	genWord("cooperate", "合作，协作"),
	genWord("coordinate", "协调，搭配"),
	genWord("corporate", "公司的，法人的"),
	genWord("correspond", "对应，通信"),
	genWord("crucial", "关键的，至关重要的"),
	genWord("currency", "货币，流通"),
	genWord("decline", "下降，衰退，谢绝"),
	genWord("demonstrate", "展示，证明，示威"),
	genWord("depict", "描绘，描述"),
	genWord("derive", "衍生，源自"),
	genWord("despite", "尽管，不管"),
	genWord("detect", "发现，察觉"),
	genWord("device", "设备，装置"),
	genWord("dimension", "维度，尺寸"),
	genWord("diminish", "减少，削弱"),
	genWord("discipline", "纪律，学科"),
	genWord("display", "展示，显示"),
	genWord("distinct", "明显的，独特的"),
	genWord("distribute", "分配，分发"),
	genWord("diverse", "多样的，不同的"),
	genWord("domestic", "国内的，家庭的"),
	genWord("dominate", "主导，支配"),
	genWord("draft", "草稿，草案"),
	genWord("duration", "持续时间，期限"),
	genWord("dynamic", "动态的，充满活力的"),
	genWord("eliminate", "消除，淘汰"),
	genWord("emerge", "出现，浮现"),
	genWord("emphasis", "强调，重点"),
	genWord("enable", "使能够，启用"),
	genWord("encounter", "遇到，邂逅"),
	genWord("enhance", "增强，提高"),
	genWord("enormous", "巨大的，庞大的"),
	genWord("ensure", "确保，保证"),
	genWord("enterprise", "企业，事业，进取心"),
	genWord("enthusiasm", "热情，热忱"),
	genWord("environment", "环境，周围"),
	genWord("equip", "装备，配备"),
	genWord("equivalent", "等同的，等价的"),
	genWord("essential", "必要的，本质的"),
	genWord("establish", "建立，设立"),
	genWord("evaluate", "评估，评价"),
	genWord("eventually", "最终，终于"),
	genWord("evidence", "证据，迹象"),
	genWord("evolve", "进化，发展"),
	genWord("exaggerate", "夸张，夸大"),
	genWord("exceed", "超过，超越"),
	genWord("exclude", "排除，不包括"),
	genWord("exhibit", "展示，展览"),
	genWord("expand", "扩张，扩展"),
	genWord("expertise", "专长，专业知识"),
	genWord("exploit", "开发，利用，剥削"),
	genWord("export", "出口，输出"),
	genWord("expose", "暴露，揭露"),
	genWord("external", "外部的，外界的"),
	genWord("extract", "提取，摘录"),
	genWord("facilitate", "促进，使便利"),
	genWord("factor", "因素，要素"),
	genWord("feature", "特征，特色"),
	genWord("flexible", "灵活的，可变通的"),
	genWord("fluctuate", "波动，起伏"),
	genWord("foundation", "基础，基金会"),
	genWord("framework", "框架，结构"),
	genWord("function", "功能，作用，函数"),
	genWord("fundamental", "基本的，根本的"),
	genWord("generate", "产生，生成"),
	genWord("gradual", "逐渐的，渐进的"),
	genWord("guarantee", "保证，担保"),
	genWord("guideline", "指导方针，准则"),
	genWord("highlight", "强调，突出显示"),
	genWord("hypothesis", "假设，假说"),
	genWord("identical", "相同的，同一的"),
	genWord("identify", "识别，确认"),
	genWord("illustrate", "阐明，（用图）说明"),
	genWord("impact", "影响，冲击"),
	genWord("implement", "实施，执行"),
	genWord("implication", "含意，暗示，影响"),
	genWord("impose", "强加，征收"),
	genWord("incentive", "激励，刺激"),
	genWord("incorporate", "合并，纳入"),
	genWord("indicate", "表明，指示"),
	genWord("inevitable", "不可避免的"),
	genWord("infrastructure", "基础设施"),
	genWord("inherent", "固有的，内在的"),
	genWord("initial", "最初的，开始的"),
	genWord("initiative", "主动性，倡议"),
	genWord("innovation", "创新，革新"),
	genWord("insight", "洞察力，见解"),
	genWord("integrate", "整合，融入"),
	genWord("integrity", "正直，完整"),
	genWord("intellectual", "智力的，知识分子"),
	genWord("intelligence", "智力，情报"),
	genWord("intense", "强烈的，紧张的"),
	genWord("interact", "互动，相互作用"),
	genWord("interpret", "解释，口译"),
	genWord("intervene", "干预，介入"),
	genWord("invest", "投资，投入"),
	genWord("involve", "涉及，包含，使参与"),
	genWord("isolate", "孤立，隔离"),
	genWord("justify", "证明…正当，为…辩护"),
	genWord("maintain", "保持，维持，保养"),
	genWord("majority", "大多数，大部分"),
	genWord("manipulate", "操纵，操作"),
	genWord("mechanism", "机制，机械装置"),
	genWord("minimise", "最小化，降到最低"),
	genWord("monitor", "监视器，监测"),
	genWord("motive", "动机，目的"),
	genWord("mutual", "互相的，共同的"),
	genWord("negotiate", "谈判，协商"),
	genWord("nevertheless", "然而，尽管如此"),
	genWord("objective", "目标，客观的"),
	genWord("obtain", "获得，得到"),
	genWord("obvious", "明显的，显然的"),
	genWord("occupation", "职业，占用"),
	genWord("occur", "发生，出现"),
	genWord("ongoing", "进行中的，持续的"),
	genWord("outcome", "结果，成果"),
	genWord("overall", "总体的，全面的"),
	genWord("participate", "参与，参加"),
	genWord("perceive", "察觉，理解，认为"),
	genWord("persist", "坚持，持续存在"),
	genWord("perspective", "观点，视角"),
	genWord("phenomenon", "现象，奇观"),
	genWord("potential", "潜力，潜在的"),
	genWord("predict", "预测，预言"),
	genWord("preliminary", "初步的，预备的"),
	genWord("preserve", "保存，保护"),
	genWord("previous", "之前的，先前的"),
	genWord("principle", "原则，原理"),
	genWord("priority", "优先，优先级"),
	genWord("procedure", "程序，步骤"),
	genWord("professional", "专业的，职业的"),
	genWord("prohibit", "禁止，阻止"),
	genWord("promote", "促进，推销，晋升"),
	genWord("proportion", "比例，部分"),
	genWord("prospect", "前景，展望"),
	genWord("purchase", "购买，购置"),
	genWord("pursue", "追求，追赶"),
	genWord("random", "随机的，任意的"),
	genWord("recover", "恢复，康复"),
	genWord("refine", "精炼，改进"),
	genWord("regulate", "调节，管理"),
	genWord("reinforce", "加强，增援"),
	genWord("reject", "拒绝，驳回"),
	genWord("release", "释放，发布"),
	genWord("relevant", "相关的，切题的"),
	genWord("reluctant", "不情愿的，勉强的"),
	genWord("rely", "依赖，依靠"),
	genWord("remove", "移除，消除"),
	genWord("resolve", "解决，决心"),
	genWord("resource", "资源，物力"),
	genWord("respond", "回应，响应"),
	genWord("restrict", "限制，约束"),
	genWord("reveal", "揭示，透露"),
	genWord("revenue", "收入，税收"),
	genWord("revolution", "革命，变革"),
	genWord("scenario", "情景，方案"),
	genWord("schedule", "时间表，计划"),
	genWord("secure", "安全的，保护"),
	genWord("significant", "重要的，有意义的"),
	genWord("simulate", "模拟，仿真"),
	genWord("specific", "具体的，特定的"),
	genWord("stability", "稳定性，稳固"),
	genWord("strategy", "策略，战略"),
	genWord("sufficient", "足够的，充分的"),
	genWord("sustain", "维持，支撑"),
	genWord("temporary", "暂时的，临时的"),
	genWord("terminate", "终止，结束"),
	genWord("transform", "转变，改造"),
	genWord("transition", "过渡，转变"),
	genWord("ultimate", "最终的，根本的"),
	genWord("undergo", "经历，承受"),
	genWord("undertake", "承担，从事"),
	genWord("uniform", "统一的，制服"),
	genWord("unique", "独特的，独一无二的"),
	genWord("valid", "有效的，合理的"),
	genWord("variable", "变量，可变的"),
	genWord("verify", "验证，核实"),
	genWord("versatile", "多才多艺的，多功能的"),
	genWord("visible", "可见的，明显的"),
	genWord("welfare", "福利，幸福"),
	genWord("widespread", "广泛的，普遍的"),
	genWord("withdraw", "撤回，提取，退出"),
	genWord("yield", "产出，屈服"),
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

func GetAllWords() []model.Word {
	return wordBank
}

func GetTotalCount() int {
	return len(wordBank)
}

func GetRandomWords(count int) []model.Word {
	if count <= 0 || count > len(wordBank) {
		count = len(wordBank)
	}

	indices := rand.Perm(len(wordBank))
	result := make([]model.Word, count)
	for i := 0; i < count; i++ {
		result[i] = wordBank[indices[i]]
	}
	return result
}

func FindWord(english string) *model.Word {
	for _, w := range wordBank {
		if w.English == english {
			return &w
		}
	}
	return nil
}
