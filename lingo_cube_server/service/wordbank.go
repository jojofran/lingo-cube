package service

import (
	"math/rand"
	"strings"
	"time"

	"lingo_cube_server/data"
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



func init() {
	rand.Seed(time.Now().UnixNano())
}

func GetAllWords() []model.Word {
	return data.Words
}

func GetTotalCount() int {
	return len(data.Words)
}

func GetRandomWords(count int) []model.Word {
	if count <= 0 || count > len(data.Words) {
		count = len(data.Words)
	}

	indices := rand.Perm(len(data.Words))
	result := make([]model.Word, count)
	for i := 0; i < count; i++ {
		result[i] = data.Words[indices[i]]
	}
	return result
}

func FindWord(english string) *model.Word {
	for _, w := range data.Words {
		if w.English == english {
			return &w
		}
	}
	return nil
}
