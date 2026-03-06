package main

import (
	"log"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/routes"
	"backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Points to the .env in your root directory
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No .env file found, relying on system env")
	}

	cfg := config.Load()

	db, err := database.ConnectDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	services.CreateTodayChallenge(db)

	router := gin.Default()
	routes.Register(router, db)

	log.Printf("Server running on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
