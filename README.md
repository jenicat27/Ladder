# Ladder 🪜💤

A cozy word-ladder puzzle. Change one letter at a time to turn the bottom word into the top word, and help a sleepy cat climb up to its top bunk.


## How to play

- Start with the word at the bottom.
- Reach the word at the top.
- Change one letter each move. Don't move letters around.
- Every word must be a real word, and you can't use a word twice.
- You have 6 moves and 3 hints. Hints don't use up moves.


Rules:

- Every word has 4 letters and appears in `WORDS`.
- Each step changes exactly one letter.
- The path is 6 moves or fewer, which means 7 words at most.

The first puzzle in the list is always the opening game. After that, **Play Again** picks puzzles at random.

To give a word a friendly clue for the first hint, add it to `CLUES` in `js/game.js`.

## Credits

The word list comes from the Hunspell `en_US` dictionary (SCOWL).
