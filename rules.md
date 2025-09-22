# Rules for contributors

## General

* Keep the codebase minimal, clean and readable. Don't comment obvious things.
* Inline variables and functions that are only used once, but try to create helper functions for 3x+ repeating patterns.
* Don't reinvent the wheel, don't repeat yourself, use standard components, patterns and practices.
* Use `bun` for package management instead of npm
* Use `pocketbase-typegen --db ../pocketbase/pb_data/data.db --out src/util/pocketbase-types.ts` in `/sveltekit` to generate types for the pocketbase collections and use them!
* Ask for permissions if you want to add dependencies!

## Svelte

* Use svelte5 runes, i.e. $effect, $derived, etc. and typescript everywhere
* No serverside svelte stuff!
* Follow the sveltekit routing pattern, i.e. common functions in lib, pages in routes, etc.
* Simplify to `func = () => x`, so try to avoid `{ return x }` blocks
* For components, use a single `error` variable initialized with "Loading..." and update it to an empty string if everything is fine, or to an error message if loading failed.
* No `loading` variables in components
* No custom css, use only tailwind classes
* After completing a sub-task rebuild and check if everything works without warnings

## Pocketbase as a frontend lib

* Try to avoid N+1 requests, use the `expand` parameter. If you must fetch data from multiple tables, use `Promise.all()`
* Use the `pocketbase` instance from `src/lib/pocketbase.ts` for all requests, so we have a single point of configuration
* You can test requests via the user "admin@admin.at" password "adminadmin", user collection "_superusers", i.e. to see the structure of a request with expands.