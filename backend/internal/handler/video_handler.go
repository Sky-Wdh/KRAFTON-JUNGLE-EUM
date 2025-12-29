package handler

import (
	"time"

	"realtime-backend/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/livekit/protocol/auth"
)

type VideoHandler struct {
	cfg *config.Config
}

func NewVideoHandler(cfg *config.Config) *VideoHandler {
	return &VideoHandler{cfg: cfg}
}

type TokenRequest struct {
	RoomName        string `json:"roomName"`
	ParticipantName string `json:"participantName"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

// GenerateToken creates a LiveKit access token for a participant
func (h *VideoHandler) GenerateToken(c *fiber.Ctx) error {
	var req TokenRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// If participantName is missing from body, try to use authenticated user's nickname
	// This is a slight enhancement to fit the current project's auth verification
	if req.ParticipantName == "" {
		nickname := c.Locals("nickname")
		if n, ok := nickname.(string); ok && n != "" {
			req.ParticipantName = n
		}
	}

	if req.RoomName == "" || req.ParticipantName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "roomName and participantName are required",
		})
	}

	// Create access token
	at := auth.NewAccessToken(h.cfg.LiveKit.APIKey, h.cfg.LiveKit.APISecret)

	// Create video grant
	grant := &auth.VideoGrant{
		RoomJoin: true,
		Room:     req.RoomName,
	}

	at.AddGrant(grant).
		SetIdentity(req.ParticipantName).
		SetValidFor(time.Hour * 24)

	token, err := at.ToJWT()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(TokenResponse{Token: token})
}
