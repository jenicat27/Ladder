# Ladder 🪜💤

A cozy word-ladder puzzle. Change one letter at a time to turn the bottom word into the top word, and help a sleepy cat climb up to its top bunk.

**Play:** `https://<your-username>.github.io/<repo-name>/`

## How to play

- Start with the word at the bottom.
- Reach the word at the top.
- Change one letter each move. Don't move letters around.
- Every word must be a real word, and you can't use a word twice.
- You have 6 moves and 3 hints. Hints don't use up moves.

## Project files

```
index.html     page structure and illustrations (inline SVG)
css/style.css  all styling and animations
js/words.js    word list, puzzles, and hint word lists
js/game.js     game logic: validation, climbing, hints, win/lose screens
favicon.svg    browser tab icon
.nojekyll      tells GitHub Pages to serve the files as-is
```

It is plain HTML, CSS and JavaScript, with no build step and no dependencies. The only outside request is the Google Fonts stylesheet for Fredoka and Patrick Hand.

## Deploy to GitHub Pages

### Option A: in the browser (no Git needed)

1. Sign in to GitHub and click **New repository**. Name it, for example `ladder`, set it to **Public**, and click **Create repository**.
2. On the new repo page, click **uploading an existing file**.
3. Drag in everything **inside** the `ladder-game` folder: `index.html`, `favicon.svg`, `README.md`, and the `css` and `js` folders. `index.html` must sit at the top level of the repo, not inside a subfolder.
4. Click **Commit changes**.
5. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose branch **main** and folder **/ (root)**, then click **Save**.
6. Wait a minute or two and refresh. The page shows your link: `https://<your-username>.github.io/ladder/`.

Note: the browser uploader can skip hidden files like `.nojekyll`. The site works without it.

### Option B: with Git

```bash
cd ladder-game
git init
git add .
git commit -m "Ladder game"
git branch -M main
git remote add origin https://github.com/<your-username>/ladder.git
git push -u origin main
```

Then turn on Pages as in step 5 above.

### Updating the game

Edit the files, then commit and push (or upload the changed files again). GitHub Pages republishes automatically within a minute or two.

## Adding puzzles

Each puzzle in `js/words.js` is a full solution path, from the start word to the destination word:

```js
["cold","cord","card","ward","warm"]
```

Keep these rules:

- Every word has 4 letters and appears in `WORDS`.
- Each step changes exactly one letter.
- The path is 6 moves or fewer, which means 7 words at most.

The first puzzle in the list is always the opening game. After that, **Play Again** picks puzzles at random.

To give a word a friendly clue for the first hint, add it to `CLUES` in `js/game.js`.

## Credits

The word list comes from the Hunspell `en_US` dictionary (SCOWL).
