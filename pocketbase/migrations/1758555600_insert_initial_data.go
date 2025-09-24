package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// Create rooms
		rooms := []map[string]string{
			{"name": "15-04", "floor": "15"},
			{"name": "15-05", "floor": "15"},
			{"name": "15-06", "floor": "15"},
			{"name": "08-03", "floor": "8"},
			{"name": "08-05", "floor": "8"},
			{"name": "08-07", "floor": "8"},
			{"name": "08-08", "floor": "8"},
			{"name": "buffet", "floor": "0"},
			{"name": "other", "floor": "0"},
		}

		roomCollection, err := app.FindCollectionByNameOrId("room")
		if err != nil {
			return err
		}

		roomRecords := make(map[string]string)
		for _, roomData := range rooms {
			room := core.NewRecord(roomCollection)
			room.Set("name", roomData["name"])
			room.Set("floor", roomData["floor"])
			if err := app.Save(room); err != nil {
				return err
			}
			roomRecords[roomData["name"]] = room.Id
		}

		// Create tags
		tags := []string{
			"hardware",
			"coding",
			"testing",
			"security",
			"infrastructure",
			"entertainment",
			"meta",
			"community",
		}

		tagCollection, err := app.FindCollectionByNameOrId("tag")
		if err != nil {
			return err
		}

		tagRecords := make(map[string]string)
		for _, tagName := range tags {
			tag := core.NewRecord(tagCollection)
			tag.Set("name", tagName)
			if err := app.Save(tag); err != nil {
				return err
			}
			tagRecords[tagName] = tag.Id
		}

		// Create user markus
		usersCollection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		markusUser := core.NewRecord(usersCollection)
		markusUser.Set("username", "markus")
		markusUser.Set("email", "markus@example.com")
		markusUser.Set("password", "markus91")
		markusUser.Set("name", "markus")
		markusUser.Set("secret", "socrates2025")
		if err := app.Save(markusUser); err != nil {
			return err
		}

		// Create talks
		talks := []map[string]interface{}{
			// Friday, 26. Sep 2025
			{
				"name":            "Doors opening",
				"description":     "Kuchen (Apfel-Vanille & Nuss-Weichsel) & Obst",
				"start":           "2025-09-26 13:00:00.000Z",
				"durationMinutes": 60,
				"room":            roomRecords["15-04"],
				"language":        "german",
			},
			{
				"name":            "Marketplace",
				"description":     "Kuchen (Apfel-Vanille & Nuss-Weichsel) & Obst",
				"start":           "2025-09-26 14:00:00.000Z",
				"durationMinutes": 180,
				"room":            roomRecords["15-04"],
				"language":        "german",
			},
			{
				"name":            "Gemüse-Lasagne, Golden Curry",
				"description":     "",
				"start":           "2025-09-26 17:00:00.000Z",
				"durationMinutes": 180,
				"room":            roomRecords["buffet"],
				"language":        "german",
			},
			{
				"name":            "Evening News",
				"description":     "",
				"start":           "2025-09-26 20:00:00.000Z",
				"durationMinutes": 60,
				"room":            roomRecords["15-04"],
				"language":        "german",
			},
			{
				"name":            "BaaS'ed: Low code backend design with pocketbase",
				"description":     "We'll design a small socrates fahrplan, inspired by fahrplan.events.ccc.de with pocketbase, sveltkit and claude 4",
				"start":           "2025-09-26 16:00:00.000Z",
				"durationMinutes": 60,
				"room":            roomRecords["15-05"],
				"speaker":         []string{markusUser.Id},
				"tags":            []string{tagRecords["coding"]},
				"language":        "english",
			},
			// Saturday, 27. Sep 2025
			{
				"name":            "Doors Opening + Kuchen & Obst",
				"description":     "",
				"start":           "2025-09-27 09:00:00.000Z",
				"durationMinutes": 120,
				"room":            roomRecords["15-04"],
				"language":        "german",
			},
			{
				"name":            "Kürbis-Kartoffel-Gulasch, Pasta mit Cashew-Carbonara & Tofu-Speck",
				"description":     "",
				"start":           "2025-09-27 11:00:00.000Z",
				"durationMinutes": 240,
				"room":            roomRecords["buffet"],
				"language":        "german",
			},
			{
				"name":            "Kuchen (Schoko-Weichsel & Schoko-Orange) & Obst",
				"description":     "",
				"start":           "2025-09-27 15:00:00.000Z",
				"durationMinutes": 60,
				"room":            roomRecords["buffet"],
				"language":        "german",
			},
			{
				"name":            "Closing the Space",
				"description":     "",
				"start":           "2025-09-27 17:00:00.000Z",
				"durationMinutes": 60,
				"room":            roomRecords["other"],
				"language":        "german",
			},
			{
				"name":            "Chili sin Carne, Linsen-Tofu-Ragout mit Kartofferl",
				"description":     "",
				"start":           "2025-09-27 18:00:00.000Z",
				"durationMinutes": 60,
				"room":            roomRecords["buffet"],
				"language":        "german",
			},
		}

		talkCollection, err := app.FindCollectionByNameOrId("talk")
		if err != nil {
			return err
		}

		for _, talkData := range talks {
			talk := core.NewRecord(talkCollection)
			talk.Set("name", talkData["name"])
			talk.Set("description", talkData["description"])
			talk.Set("start", talkData["start"])
			talk.Set("durationMinutes", talkData["durationMinutes"])
			talk.Set("room", talkData["room"])
			talk.Set("language", talkData["language"])

			if speaker, ok := talkData["speaker"]; ok {
				talk.Set("speaker", speaker)
			}

			if tags, ok := talkData["tags"]; ok {
				talk.Set("tags", tags)
			}

			if err := app.Save(talk); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		// Down migration - remove all the data we created

		// Delete all talks
		talkCollection, err := app.FindCollectionByNameOrId("talk")
		if err != nil {
			return err
		}

		talks, err := app.FindRecordsByFilter(talkCollection.Id, "", "-created", 500, 0)
		if err != nil {
			return err
		}

		for _, talk := range talks {
			if err := app.Delete(talk); err != nil {
				return err
			}
		}

		// Delete user markus
		markusUser, _ := app.FindAuthRecordByEmail("users", "markus@example.com")
		if markusUser != nil {
			if err := app.Delete(markusUser); err != nil {
				return err
			}
		}

		// Delete all tags
		tagCollection, err := app.FindCollectionByNameOrId("tag")
		if err != nil {
			return err
		}

		tags, err := app.FindRecordsByFilter(tagCollection.Id, "", "-created", 500, 0)
		if err != nil {
			return err
		}

		for _, tag := range tags {
			if err := app.Delete(tag); err != nil {
				return err
			}
		}

		// Delete all rooms
		roomCollection, err := app.FindCollectionByNameOrId("room")
		if err != nil {
			return err
		}

		rooms, err := app.FindRecordsByFilter(roomCollection.Id, "", "-created", 500, 0)
		if err != nil {
			return err
		}

		for _, room := range rooms {
			if err := app.Delete(room); err != nil {
				return err
			}
		}

		return nil
	})
}
