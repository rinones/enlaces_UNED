# Data folder schema

This file documents the JSON formats used under `data/` for activities and calendar defaults.

## `data/activities/general.json`
- An array of activity objects for site-wide activities.

## `data/activities/subjects/<slug>.json`
- An array of activity objects specific to a subject.
- The subject slug is the filename (e.g. `redes` for `redes.json`).

## Activity object schema
- `date` or `ymd` (string, required): date in `YYYY-MM-DD` format.
- `title` or `text` (string, required): human title.
- `link` (string, optional): URL.
- `pages` (array of strings, optional): list of page keys where the activity should appear. Examples: `['home','travel','uned']`.
- `page` (string, optional): single page key (legacy alternative to `pages`).
- `subject` (string, optional): subject slug when activity is tied to a subject explicitly.

If neither `pages` nor `page` is provided the activity is treated as global and may be shown on any page. For subject files, the file slug indicates the subject; you can also include `subject` inside items for clarity.


## `data/calendar.json`
Used by the calendar module to seed localStorage notes and provide a default starting month/year.
Schema:
- `events`: array of objects with `date` (YYYY-MM-DD), `text` (string), `link` (string, optional), and optional `pages`/`page` as above.
- `start`: object with `year` (number) and `month` (0-based month number: 0=Jan, 11=Dec). Example: `{ "year": 2025, "month": 9 }` for October 2025.


## Page keys
The site maps filenames to page keys via `inferLinksKeyFromPath()`:
- `index.html` or `/` -> `home`
- `travel.html` -> `travel`
- `contenido.html` -> `content`
- `uned.html` -> `uned`

Use these keys when specifying `pages` or `page` in activities.
