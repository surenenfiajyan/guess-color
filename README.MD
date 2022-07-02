# GuessColor game
## Description
This type of game is based on [Bulls and Cows](https://en.wikipedia.org/wiki/Bulls_and_Cows). The goal of this game is to guess 4 different colors with as few attempts as possible using a provided hint after each guess. After submitting your guess you get a hint saying how many colors are correct and in correct positions and how many are correct but in wrong positions. This implemetation also has the "reverse game" which is the opposite, the computer guesses your chosen colors using the hints provided by you. On average with default settings (all colors and disabled color repeat) it requires 5 - 6 attempts to guess in the case of 10 different possible colors that the game has.
## How to run the game
This game is designed for Chrome and Chromium based browsers and it won't run normally on other browsers. The game won't run by just opening index.html with Browser, since the game uses JS modules. There are several ways to run this game.
1. Perhaps the easiest way, just open this [link](https://surenenfiajyan.github.io/guess-color/).
2. If you want to run locally, download the source code and unpack in some folder. On Chrome or other Chromium based browser open **chrome://extensions/** page and enable developer mode toggle. Then click **Load unpacked extension** and select the folder where you unpacked the source files and the extension should load successfully.
3. Another option is hosting the source files with a localhost server.
4. There is also an [Android app](https://raw.githubusercontent.com/surenenfiajyan/files/main/GuessColor.apk), make sure you have enabled "Unknown sources" on your Android device.
## License
[MIT license](https://github.com/surenenfiajyan/guess-color/blob/main/LICENSE)
