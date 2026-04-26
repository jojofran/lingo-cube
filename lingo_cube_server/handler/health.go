package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"lingo_cube_server/model"
)

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, model.Success(gin.H{
		"status": "ok",
	}))
}
