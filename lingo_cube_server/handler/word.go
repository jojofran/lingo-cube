package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"lingo_cube_server/model"
	"lingo_cube_server/service"
)

func GetAllWords(c *gin.Context) {
	words := service.GetAllWords()
	c.JSON(http.StatusOK, model.Success(model.WordListResponse{
		Words: words,
		Total: len(words),
	}))
}

func GetRandomWords(c *gin.Context) {
	countStr := c.DefaultQuery("count", "20")
	count, err := strconv.Atoi(countStr)
	if err != nil || count < 1 {
		count = 20
	}
	if count > 50 {
		count = 50
	}

	words := service.GetRandomWords(count)
	c.JSON(http.StatusOK, model.Success(model.WordListResponse{
		Words: words,
		Total: len(words),
	}))
}

func GetWordDetail(c *gin.Context) {
	english := c.Param("english")
	w := service.FindWord(english)
	if w == nil {
		c.JSON(http.StatusNotFound, model.Error(404, "word not found"))
		return
	}
	c.JSON(http.StatusOK, model.Success(*w))
}
