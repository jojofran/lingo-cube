package service

import (
	"math/rand"
	"time"

	"lingo_cube_server/data"
	"lingo_cube_server/model"
)



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
	return data.WordsMap[english]
}
