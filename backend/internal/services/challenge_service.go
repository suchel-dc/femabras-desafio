package services

import (
	"crypto/rand"
	"fmt"
	"log" // FIX: Add this
	"math/big"
	"strings"
	"time"

	"backend/internal/models"
	"gorm.io/gorm"
)

func GenerateDailySecret(minLength, maxLength int) (string, int, error) {
	lenRange := int64(maxLength - minLength + 1)
	lenBig, _ := rand.Int(rand.Reader, big.NewInt(lenRange))
	length := minLength + int(lenBig.Int64())

	var builder strings.Builder
	for i := 0; i < length; i++ {
		num, _ := rand.Int(rand.Reader, big.NewInt(10))
		fmt.Fprintf(&builder, "%d", num.Int64())
	}
	return builder.String(), length, nil
}

func CreateTodayChallenge(db *gorm.DB) {
	today := time.Now().UTC().Truncate(24 * time.Hour)

	var existing models.Challenge
	if err := db.Where("release_date = ?", today).First(&existing).Error; err != nil {
		secretCode, difficulty, _ := GenerateDailySecret(3, 8)

		newChallenge := models.Challenge{
			SecretCode:  secretCode,
			Difficulty:  difficulty,
			ReleaseDate: today,
		}

		if err := db.Create(&newChallenge).Error; err == nil {
			log.Printf("🚀 New Challenge Created: %s", secretCode)
		}
	}
}
