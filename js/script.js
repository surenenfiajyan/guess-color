import { GuessColorsGame } from './GuessColorsGame.js';
import { GuessColorsReverseGame } from './GuessColorsReverseGame.js';

GuessColorsReverseGame.loadWasmModule().then(() => {
	const game = new GuessColorsGame();
});

