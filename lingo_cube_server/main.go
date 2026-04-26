package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"lingo_cube_server/config"
	"lingo_cube_server/middleware"
	"lingo_cube_server/route"
)

func main() {
	cfg := config.Load()

	r := gin.Default()

	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	route.Setup(r)

	log.Printf("Server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
