import { GuessColorsGame } from './GuessColorsGame.js';
import { GuessColorsReverseGame } from './GuessColorsReverseGame.js';

await GuessColorsReverseGame.loadWasmModule();
new GuessColorsGame();
