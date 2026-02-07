# Book Finder + Reading List

Vanilla JS web app for WDD 330.

## Features (in progress)

- Search Google Books (title/author/keyword/subject)
- View basic book details
- Save/remove books in a local reading list (localStorage)

## Run Locally

Because this uses ES modules, run with a local server.

Example:

```bash
python3 -m http.server
```

Then open:

- `http://localhost:8000/final-project/`

## API Key (Optional)

`final-project/js/config.js` contains `GOOGLE_BOOKS_API_KEY`.

- It can be left blank for light usage.
- If you add a key, avoid exposing it in a private/billing project.
