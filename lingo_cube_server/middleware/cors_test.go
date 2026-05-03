package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupCORS(handler gin.HandlerFunc) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(handler)
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "ok")
	})
	return r
}

func TestCORSWildcard(t *testing.T) {
	os.Unsetenv("CORS_ORIGIN")
	defer os.Unsetenv("CORS_ORIGIN")

	r := setupCORS(CORS())
	req, err := http.NewRequest("GET", "/test", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Origin", "https://example.com")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	origin := w.Header().Get("Access-Control-Allow-Origin")
	if origin != "*" {
		t.Errorf("expected Access-Control-Allow-Origin: *, got '%s'", origin)
	}
}

func TestCORSOptionsPreflight(t *testing.T) {
	os.Unsetenv("CORS_ORIGIN")
	defer os.Unsetenv("CORS_ORIGIN")

	r := setupCORS(CORS())
	req, err := http.NewRequest("OPTIONS", "/test", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Origin", "https://example.com")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 204 {
		t.Errorf("expected status 204 for OPTIONS, got %d", w.Code)
	}
}

func TestCORSSpecificOrigin_Match(t *testing.T) {
	os.Setenv("CORS_ORIGIN", "https://example.com,https://app.example.com")
	defer os.Unsetenv("CORS_ORIGIN")

	r := setupCORS(CORS())

	req, err := http.NewRequest("GET", "/test", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Origin", "https://example.com")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	origin := w.Header().Get("Access-Control-Allow-Origin")
	if origin != "https://example.com" {
		t.Errorf("expected Access-Control-Allow-Origin: https://example.com, got '%s'", origin)
	}
}

func TestCORSSpecificOrigin_NoMatch(t *testing.T) {
	os.Setenv("CORS_ORIGIN", "https://example.com")
	defer os.Unsetenv("CORS_ORIGIN")

	r := setupCORS(CORS())

	req, err := http.NewRequest("GET", "/test", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Origin", "https://evil.com")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	origin := w.Header().Get("Access-Control-Allow-Origin")
	if origin != "" {
		t.Errorf("expected no Access-Control-Allow-Origin header, got '%s'", origin)
	}
}

func TestCORSHeadersSet(t *testing.T) {
	os.Unsetenv("CORS_ORIGIN")
	defer os.Unsetenv("CORS_ORIGIN")

	r := setupCORS(CORS())
	req, err := http.NewRequest("GET", "/test", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	methods := w.Header().Get("Access-Control-Allow-Methods")
	if methods != "GET, POST, PUT, DELETE, OPTIONS" {
		t.Errorf("expected Access-Control-Allow-Methods header, got '%s'", methods)
	}

	headers := w.Header().Get("Access-Control-Allow-Headers")
	if headers != "Content-Type, Authorization" {
		t.Errorf("expected Access-Control-Allow-Headers header, got '%s'", headers)
	}
}
