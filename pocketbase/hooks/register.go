package hooks

import (
	"errors"
	"fmt"
	"time"

	"github.com/pocketbase/pocketbase/core"
)

func Register(app core.App) {
	// register your hooks here, e.g. `OnRecordCreate`
	// Docs https://pocketbase.io/docs/go-event-hooks/

	// Add overlap detection for talk creation
	app.OnRecordCreateRequest("talk").BindFunc(func(e *core.RecordRequestEvent) error {
		return checkTalkOverlap(e, "")
	})

	// Add overlap detection for talk updates
	app.OnRecordUpdateRequest("talk").BindFunc(func(e *core.RecordRequestEvent) error {
		return checkTalkOverlap(e, e.Record.Id)
	})
}

func checkTalkOverlap(e *core.RecordRequestEvent, excludeId string) error {
	// Get the new talk details
	startTimeStr := e.Record.GetString("start")
	durationMinutes := e.Record.GetFloat("durationMinutes")
	roomId := e.Record.GetString("room")

	if startTimeStr == "" || durationMinutes == 0 || roomId == "" {
		return nil // Skip validation if required fields are missing
	}

	// Parse start time
	startTime, err := time.Parse("2006-01-02 15:04:05.000Z", startTimeStr)
	if err != nil {
		return fmt.Errorf("invalid start time format: %v", err)
	}

	// Calculate end time
	endTime := startTime.Add(time.Duration(durationMinutes) * time.Minute)

	// Find all talks in the same room
	talks, err := e.App.FindRecordsByFilter("talk", fmt.Sprintf("room = '%s'", roomId), "", 0, 0)
	if err != nil {
		return fmt.Errorf("failed to fetch existing talks: %v", err)
	}

	// Check for overlaps with existing talks
	for _, existingTalk := range talks {
		// Skip the current record if we're updating
		if excludeId != "" && existingTalk.Id == excludeId {
			continue
		}

		existingStartStr := existingTalk.GetString("start")
		existingDurationMinutes := existingTalk.GetFloat("durationMinutes")

		if existingStartStr == "" || existingDurationMinutes == 0 {
			continue // Skip invalid records
		}

		// Parse existing talk times
		existingStart, err := time.Parse("2006-01-02 15:04:05.000Z", existingStartStr)
		if err != nil {
			continue // Skip invalid records
		}

		existingEnd := existingStart.Add(time.Duration(existingDurationMinutes) * time.Minute)

		// Check for overlap: talks overlap if one starts before the other ends
		if startTime.Before(existingEnd) && endTime.After(existingStart) {
			existingTalkName := existingTalk.GetString("name")
			newTalkName := e.Record.GetString("name")

			return errors.New(fmt.Sprintf(
				"Talk overlap detected! '%s' (%s - %s) overlaps with existing talk '%s' (%s - %s) in the same room",
				newTalkName,
				formatTime(startTime),
				formatTime(endTime),
				existingTalkName,
				formatTime(existingStart),
				formatTime(existingEnd),
			))
		}
	}

	return e.Next()
}

func formatTime(t time.Time) string {
	return t.Format("2006-01-02 15:04")
}
