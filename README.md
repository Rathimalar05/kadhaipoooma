# Kadhaipooma

A cafe website for people who talk and share their memories — with a **Story Wall** where guests can read and pin their own stories.

## Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla HTML/CSS/JS (no build step, no framework)
- **Storage:** A local JSON file (`data/stories.json`) — no database to install or configure

## What's included

- `index.html` — home page
- `menu.html` — cafe menu
- `stories.html` — browse the Story Wall and submit a new story
- `about.html` — the cafe's story
- `contact.html` — hours, address, contact info
- `server.js` + `routes/stories.js` — a small REST API (`GET /api/stories`, `POST /api/stories`, `POST /api/stories/:id/like`)

## Run it locally (Windows, macOS, or Linux)

**Requirements:** [Node.js](https://nodejs.org) version 18 or newer. Check with:

```
node -v
```

**1. Unzip** this project anywhere, then open a terminal in that folder.

**2. Install dependencies:**

```
npm install
```

**3. Start the server:**

```
npm start
```

**4. Open the site:** go to **http://localhost:3000** in your browser.

That's it — no MongoDB, no `.env` file, no extra setup. Stories you submit are saved to `data/stories.json` and will still be there next time you start the server.

### If npm install fails on Windows

If your machine blocks running `.exe` files directly (Application Control policy), install and run Node through its module form instead:

```
node -e "console.log('node works')"
```

If that runs fine, `npm install` and `npm start` will work as-is, since npm itself runs through Node. If you still hit an execution block, try:

```
node .\node_modules\npm\bin\npm-cli.js install
node server.js
```

### Changing the port

By default the site runs on port 3000. To use a different port:

```
set PORT=4000 && npm start      (Windows, cmd.exe)
$env:PORT=4000; npm start       (Windows, PowerShell)
PORT=4000 npm start             (macOS/Linux)
```

## Editing content

- **Menu items:** edit the tables directly in `public/menu.html`.
- **Seed stories:** edit `data/stories.json` (must stay valid JSON — an array of objects with `id`, `name`, `title`, `story`, `mood`, `likes`, `createdAt`).
- **Colors/fonts:** all design tokens are at the top of `public/css/style.css` under `:root`.
- **Moods:** the allowed story moods (`warm`, `nostalgic`, `funny`, `bittersweet`, `hopeful`) are defined in both `routes/stories.js` (`MOODS`) and `public/js/stories.js` (`MOOD_LABELS`) — update both if you add or rename one.

## Notes on the Story Wall

- Submissions are public and go live immediately (no moderation queue by default). If you want to review stories before they're visible, that's the one piece of logic to add in `routes/stories.js`.
- Storage is a single JSON file, which is fine for a real small-cafe site but not built for heavy concurrent traffic. If this ever needs to scale, swap `readStories`/`saveStories` in `routes/stories.js` for a real database — the rest of the API stays the same.
