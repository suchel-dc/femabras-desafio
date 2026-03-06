package models

type GuessRequest struct {
	// 'binding:"required"' ensures the API returns an error if the field is missing
	Guess string `json:"guess" binding:"required"`
}
