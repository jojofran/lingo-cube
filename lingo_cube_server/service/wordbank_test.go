package service

import (
	"testing"
	"lingo_cube_server/data"
)

func TestGetAllWords(t *testing.T) {
	words := GetAllWords()
	if len(words) == 0 {
		t.Error("expected non-empty word list")
	}
}

func TestGetTotalCount(t *testing.T) {
	count := GetTotalCount()
	if count != len(data.Words) {
		t.Errorf("expected %d, got %d", len(data.Words), count)
	}
}

func TestGetRandomWords_Count(t *testing.T) {
	words := GetRandomWords(5)
	if len(words) != 5 {
		t.Errorf("expected 5 words, got %d", len(words))
	}
}

func TestGetRandomWords_ZeroCount(t *testing.T) {
	words := GetRandomWords(0)
	if len(words) != len(data.Words) {
		t.Errorf("expected %d words, got %d", len(data.Words), len(words))
	}
}

func TestFindWord_Found(t *testing.T) {
	word := FindWord("abandon")
	if word == nil {
		t.Error("expected to find 'abandon'")
	}
	if word.English != "abandon" {
		t.Errorf("expected 'abandon', got '%s'", word.English)
	}
}

func TestFindWord_NotFound(t *testing.T) {
	word := FindWord("nonexistentwordxyz")
	if word != nil {
		t.Error("expected nil for nonexistent word")
	}
}
