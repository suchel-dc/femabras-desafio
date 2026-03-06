package routes

import (
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Register(router *gin.Engine, db *gorm.DB) {
	router.Use(middleware.CORS())

	// This will now find 'handlers.ChallengeHandler'
	h := &handlers.ChallengeHandler{DB: db}

	router.GET("/challenge", h.GetDailyChallenge)
	router.POST("/guess", h.SubmitGuess)
}
