# GuessColor game
## Description
This game is also known as [Mastermind](https://en.wikipedia.org/wiki/Mastermind_(board_game)). The goal of this game is to guess 4 different colors with as few attempts as possible using a provided hint after each guess. After submitting your guess you get a hint saying how many colors are correct and in correct positions and home many are correct but in wrong positions. This implemetation also has the "reverse game" which is the opposite, the computer guesses your chosen colors using the hints provided by you. On average it requires 5 - 6 attempts to guess in the case of 10 different possible colors that the game has.
## How to get it work
This game is designed for Chrome and Chromium based browsers and it won't run normally on other browsers. The game won't run by just opening index.html with Browser, since the game uses JS modules. There are several ways to run this game.
1. Perhaps this is the easiest one. Download the source code and unpack in some folder. On Chrome or other Chromium based browser open **chrome://extensions/** page and enable developer mode toggle. Then click **Load unpacked extension** and select the folder where you unpacked the source files and the extension should load successfully.
2. Another option is hosting the source files with a localhost server.
