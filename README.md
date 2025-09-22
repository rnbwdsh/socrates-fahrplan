# Socrates fahrplan

This is a demo project for the socrates unconference 2025, to showcase the power of pocketbase as a backend with a modern sveltekit frontend.

Here are the main bullet points
* User edit page where you can change your email, emailVisible, password, avatar, bio, website, talksToVisit.
* Users can only register if they post the secret "socrates2025" in the body.
* User component that is embedded in a talk page.
* Talk edit/create page where you can put a
  * Name, startTime, duration (nonempty)
  * Description
  * speakers (multi-relation to user)
  * room (relation to room), nonempty
  * tags (multi-relation to tag)
  * files (multi-file)
  * language (select of "de" or "en")

# Step 0: Architecture & Planning

Define the overall architecture and technology stack for the conference management system.

# Step 1: Backend + Data structure

Create db entities in pocketbase:

* Create room table (read+list all)
* Create tag table (read+list all)
* Create talk (read+list all, create logged in, update own talk + speakerless talk, delete own talk + speakerless talk)
* Talk update+delete rule: `speaker ?~ @request.auth.id || speaker:length = 0`
* Modify user: New fieldsA: bio, website, talksToVisit. Unique constraint name + Auth with username + create rule `@request.body.secret = 'socrates2025'`

Visualize the result with [Pocketbase-uml](https://pocketbase-uml.github.io/)

![data-structure.png](presentation/data-structure.png)

This automatically created us the migrations
* [1758554690_created_tag.go](pocketbase/migrations/1758554690_created_tag.go)
* [1758554722_created_room.go](pocketbase/migrations/1758554722_created_room.go)
* [1758555389_created_talk.go](pocketbase/migrations/1758555389_created_talk.go)
* [1758555583_updated_users.go](pocketbase/migrations/1758555583_updated_users.go)

# Step 2: Frontend vibes

Vibe coding. We'll use claude to generate the code. I have prepared something.

* The base page should be visible to everyone, even when not logged in.
* Non-logged in users can favourite talks to their svelte-persisted-store, logged in users can favourite talks to their user.talksToVisit field.
* The login page needs a secret field.
* The navbar should contain links to the user edit field on the top right, next to the logout, primary button color. Logout is secondary color. Test user editing by sending raw requests for the user markus/markus91 via a node console or curl.
* The main page (no matter if logged in or not) should show all talks for the current day
  * The current day should be selectable. Fetch all talks onMount -> filter clientside, determine the days from the talks. Use derived for this.
  * Subscribe to the talks collection for realtime updates.
  * The default current day is today OR the first day with talks. Vertically scroll to the earliest ongoing talk that is not yet finished, or the first talk of the day.
  * For now, do basic alert() error handling. We'll improve that later.
  * Use a css grid layout, talk name is bold. Clicking on a talk opens the talk detail page.
  * Use box sizes so that on a 1920x1080 screen, 2 boxes fit next to each other and at least 6h fit below each other. The box size should determine the duration, the "lane" should determine the room.
  * Talks should have a heart button to add them to talksToVisit. If a talk is editable (according to previous rules), show an edit button.
  * For now, no sanity checking if talks overlap. This will be step 4. You can already specify this as a create/update hook in this file.
* Talk detail page, with the embedded user component
* User detail page, with the list of talksToVisit and a list of talks where the user is a speaker via expand (not shown in the talk component)

# Step 3: Manually insert data via nodejs/bun script

Create scripts in `sveltekit/scripts` to insert some data, i.e. tags and rooms.

# Step 4: Migrations

AI coded: Create a hook for the insert/update of a talk, that checks for overlaps in go. Save it into /scripts.

Then manually try to insert a talk that overlaps with `BaaS'ed: Low code backend design with pocketbase` in 4 ways: starts during, ends during, starts before and ends after, starts inbetween and ends inbetween.

You will have to restart the pocketbase server after creating the hook.

# Further docs

This project is based on the [pocketbase-sveltekit-static](https://github.com/Egor-S/pocketbase-sveltekit-static) repo. The original readme is at [README.template.md](./README.template.md).

If you want to contribute (AI or human), read the [rules.md](./rules.md).