package route

import (
	"github.com/gin-gonic/gin"
	"lingo_cube_server/handler"
)

func Setup(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.GET("/health", handler.HealthCheck)
		api.GET("/words", handler.GetAllWords)
		api.GET("/words/random", handler.GetRandomWords)
		api.GET("/words/:english", handler.GetWordDetail)
	}
}
