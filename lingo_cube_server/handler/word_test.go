package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"lingo_cube_server/model"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/api/words", GetAllWords)
	r.GET("/api/words/random", GetRandomWords)
	r.GET("/api/words/:english", GetWordDetail)
	return r
}

func TestGetAllWords(t *testing.T) {
	r := setupRouter()
	req, err := http.NewRequest("GET", "/api/words", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp model.Response
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != 0 {
		t.Errorf("expected response code 0, got %d", resp.Code)
	}

	dataBytes, err := json.Marshal(resp.Data)
	if err != nil {
		t.Fatalf("failed to marshal data: %v", err)
	}
	var listResp model.WordListResponse
	if err := json.Unmarshal(dataBytes, &listResp); err != nil {
		t.Fatalf("failed to unmarshal word list response: %v", err)
	}
	if len(listResp.Words) == 0 {
		t.Error("expected non-empty words list")
	}
}

func TestGetRandomWords_Default(t *testing.T) {
	r := setupRouter()
	req, err := http.NewRequest("GET", "/api/words/random", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp model.Response
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	dataBytes, err := json.Marshal(resp.Data)
	if err != nil {
		t.Fatalf("failed to marshal data: %v", err)
	}
	var listResp model.WordListResponse
	if err := json.Unmarshal(dataBytes, &listResp); err != nil {
		t.Fatalf("failed to unmarshal word list response: %v", err)
	}
	if len(listResp.Words) != 20 {
		t.Errorf("expected 20 words (default), got %d", len(listResp.Words))
	}
}

func TestGetRandomWords_MaxCap(t *testing.T) {
	r := setupRouter()
	req, err := http.NewRequest("GET", "/api/words/random?count=100", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp model.Response
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	dataBytes, err := json.Marshal(resp.Data)
	if err != nil {
		t.Fatalf("failed to marshal data: %v", err)
	}
	var listResp model.WordListResponse
	if err := json.Unmarshal(dataBytes, &listResp); err != nil {
		t.Fatalf("failed to unmarshal word list response: %v", err)
	}
	if len(listResp.Words) != 50 {
		t.Errorf("expected 50 words (capped), got %d", len(listResp.Words))
	}
}

func TestGetWordDetail_Found(t *testing.T) {
	r := setupRouter()
	req, err := http.NewRequest("GET", "/api/words/abandon", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp model.Response
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != 0 {
		t.Errorf("expected response code 0, got %d", resp.Code)
	}

	dataBytes, err := json.Marshal(resp.Data)
	if err != nil {
		t.Fatalf("failed to marshal data: %v", err)
	}
	var word model.Word
	if err := json.Unmarshal(dataBytes, &word); err != nil {
		t.Fatalf("failed to unmarshal word: %v", err)
	}
	if word.English != "abandon" {
		t.Errorf("expected 'abandon', got '%s'", word.English)
	}
}

func TestGetWordDetail_NotFound(t *testing.T) {
	r := setupRouter()
	req, err := http.NewRequest("GET", "/api/words/nonexistentwordxyz", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected status 404, got %d", w.Code)
	}

	var resp model.Response
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code == 0 {
		t.Error("expected error response code for not found")
	}
}
