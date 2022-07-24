import { CompareUtil } from "./CompareUtil.js";

export class GuessColorsReverseGame {
	#variantsLeft = [];
	#allCombinationIndexes = [];
	#allColors = [];
	#allowRepeat = false;
	#colorsCount = 4;

	constructor(allColors, allowRepeat = false, colorsCount = 4) {
		this.#allColors = [...allColors];
		this.#allowRepeat = allowRepeat;
		this.#colorsCount = colorsCount;
		this.#init();
	}

	#init() {
		const allCombinations = this.#allColors.length ** this.#colorsCount;

		for (let i = 0; i < allCombinations; ++i) {
			const combinationIndexes = [];

			for (let j = this.#colorsCount, num = i; j >= 1; --j) {
				const reminder = num % this.#allColors.length;
				combinationIndexes.push(reminder);
				num = (num - reminder) / this.#allColors.length;
			}

			if (this.#allowRepeat || (new Set(combinationIndexes)).size === this.#colorsCount) {
				this.#allCombinationIndexes.push(combinationIndexes);
			}
		}
	}

	newGame() {
		this.#variantsLeft = [...this.#allCombinationIndexes];
		this.#allColors.sort(() => Math.random() - 0.5);
		console.log('%c____________________________Starting new game_______________________________',
					'font-size: 20px; font-weight: bold;');
		console.log('Total variants: %c' + this.#variantsLeft.length, 'font-size: 20px; font-weight: bold;');
	}

	get guessedColors() {
		return this.#variantsLeft[0] ? this.#variantsLeft[0].map((colorIndex) => this.#allColors[colorIndex]) : [];
	}

	get guessed() {
		return this.#variantsLeft.length === 1;
	}

	get error() {
		return !this.#variantsLeft.length;
	}

	hint(guessedColors, coorectPos, incorrectPos) {
		console.log('The hint for the colors ' + guessedColors.map(c => `%c${c}%c`).join(', ') + ':',
					...guessedColors
					.flatMap(
						c => [
							`color: ${c}; background: gray; padding: 2px; font-size: 20px; border-radius: 5px;`,
							''
						]));
		console.log(`%cCorrect colors in correct position: %c${coorectPos}%c, ` +
					`%cCorrect colors in incorrect position: %c${incorrectPos}`,
					'color: green;',
					'color: green; font-size: 20px; font-weight: bold;',
					'',
					'color: blue;',
					'color: blue; font-size: 20px; font-weight: bold;');
		guessedColors = guessedColors.map(color => this.#allColors.indexOf(color));
		this.#variantsLeft = this.#variantsLeft.filter((possibleColors) => {
			const { exactMatches, nonExactMatches } = CompareUtil.getComparisonData(guessedColors, possibleColors);
			return exactMatches === coorectPos && nonExactMatches === incorrectPos;
		});

		if (this.#variantsLeft.length) {
			const randomIndex = Math.floor(Math.random() * this.#variantsLeft.length);
			[this.#variantsLeft[0], this.#variantsLeft[randomIndex]] = [this.#variantsLeft[randomIndex], this.#variantsLeft[0]];
		}

		console.log('Variants left after the hint: %c' + this.#variantsLeft.length,
					'font-size: 20px; font-weight: bold;' + (
						this.#variantsLeft.length <= 1 ?
							`color: ${this.#variantsLeft.length === 0 ? 'red' : 'green'}` :
							''
						)
					);
	}
}
