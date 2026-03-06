package models

import (
	"time"

	"gorm.io/gorm"
)

type Challenge struct {
	gorm.Model
	// Added JSON tags so the database fields map correctly to your API
	SecretCode  string    `gorm:"not null" json:"secret_code"`
	Difficulty  int       `gorm:"not null" json:"difficulty"`
	ReleaseDate time.Time `gorm:"type:date;uniqueIndex;not null" json:"release_date"`
}
