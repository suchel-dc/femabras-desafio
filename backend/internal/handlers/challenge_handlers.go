package handlers

import (
	"net/http"
	"sort"
	"time"

	"backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ChallengeHandler struct {
	DB *gorm.DB
}

func (h *ChallengeHandler) GetDailyChallenge(c *gin.Context) {
	var challenge models.Challenge
	today := time.Now().UTC().Format("2006-01-02")

	if err := h.DB.Where("release_date = ?", today).First(&challenge).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Desafio não encontrado"})
		return
	}

	digitMap := make(map[string]bool)
	for _, char := range challenge.SecretCode {
		digitMap[string(char)] = true
	}

	var digits []string
	for digit := range digitMap {
		digits = append(digits, digit)
	}
	sort.Strings(digits)

	c.JSON(http.StatusOK, gin.H{
		"slots":  len(challenge.SecretCode),
		"date":   today,
		"digits": digits,
	})
}

func (h *ChallengeHandler) SubmitGuess(c *gin.Context) {
	var request models.GuessRequest
	var challenge models.Challenge

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Requisição inválida"})
		return
	}

	today := time.Now().UTC().Format("2006-01-02")
	if err := h.DB.Where("release_date = ?", today).First(&challenge).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Desafio expirado"})
		return
	}

	// Professional status mapping
	status := "incorrect"
	if request.Guess == challenge.SecretCode {
		status = "success"
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}
