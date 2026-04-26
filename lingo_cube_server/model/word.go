package model

type Word struct {
	English  string `json:"english"`
	Chinese  string `json:"chinese"`
	Phonetic string `json:"phonetic"`
}

type WordListResponse struct {
	Words []Word `json:"words"`
	Total int    `json:"total"`
}
