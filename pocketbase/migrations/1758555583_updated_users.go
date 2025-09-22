package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"listRule": "",
			"viewRule": "",
			"createRule": "@request.body.secret = 'socrates2025'",
			"indexes": [
				"CREATE UNIQUE INDEX `+"`"+`idx_tokenKey__pb_users_auth_`+"`"+` ON `+"`"+`users`+"`"+` (`+"`"+`tokenKey`+"`"+`)",
				"CREATE UNIQUE INDEX `+"`"+`idx_email__pb_users_auth_`+"`"+` ON `+"`"+`users`+"`"+` (`+"`"+`email`+"`"+`) WHERE `+"`"+`email`+"`"+` != ''",
				"CREATE UNIQUE INDEX `+"`"+`idx_2pHceKzbpJ`+"`"+` ON `+"`"+`users`+"`"+` (`+"`"+`name`+"`"+`)"
			],
			"passwordAuth": {
				"identityFields": [
					"email",
					"name"
				]
			}
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(8, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text3709889147",
			"max": 0,
			"min": 0,
			"name": "bio",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(9, []byte(`{
			"exceptDomains": null,
			"hidden": false,
			"id": "url1198480871",
			"name": "website",
			"onlyDomains": null,
			"presentable": false,
			"required": false,
			"system": false,
			"type": "url"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"cascadeDelete": false,
			"collectionId": "pbc_3089740299",
			"hidden": false,
			"id": "relation2421430755",
			"maxSelect": 999,
			"minSelect": 0,
			"name": "talksToVisit",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"createRule": "",
			"indexes": [
				"CREATE UNIQUE INDEX `+"`"+`idx_tokenKey__pb_users_auth_`+"`"+` ON `+"`"+`users`+"`"+` (`+"`"+`tokenKey`+"`"+`)",
				"CREATE UNIQUE INDEX `+"`"+`idx_email__pb_users_auth_`+"`"+` ON `+"`"+`users`+"`"+` (`+"`"+`email`+"`"+`) WHERE `+"`"+`email`+"`"+` != ''"
			],
			"passwordAuth": {
				"identityFields": [
					"email"
				]
			}
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("text3709889147")

		// remove field
		collection.Fields.RemoveById("url1198480871")

		// remove field
		collection.Fields.RemoveById("relation2421430755")

		return app.Save(collection)
	})
}
