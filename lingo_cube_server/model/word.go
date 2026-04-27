package model

type WordExample struct {
	Text   string  `json:"text"`
	Weight float64 `json:"weight"`
}

type Word struct {
	English  string        `json:"english"`
	Chinese  string        `json:"chinese"`
	Phonetic string        `json:"phonetic"`
	Examples []WordExample `json:"examples,omitempty"`
}

type WordListResponse struct {
	Words []Word `json:"words"`
	Total int    `json:"total"`
}
