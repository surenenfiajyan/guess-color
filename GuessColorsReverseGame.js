export class GuessColorsReverseGame {
	#variantsLeft = [];
	#allCombinationIndexes = [];
	#allColors = [];

	constructor(allColors) {
		this.#allColors = [...allColors];
		this.#init();
	}

	#init() {
		const allColorIndexes = this.#allColors.map((color, index) => index);

		for (let a = 0; a < allColorIndexes.length; ++a) {
			[allColorIndexes[0], allColorIndexes[a]] = [allColorIndexes[a], allColorIndexes[0]];

			for (let b = 1; b < allColorIndexes.length; ++b) {
				[allColorIndexes[1], allColorIndexes[b]] = [allColorIndexes[b], allColorIndexes[1]];

				for (let c = 2; c < allColorIndexes.length; ++c) {
					[allColorIndexes[2], allColorIndexes[c]] = [allColorIndexes[c], allColorIndexes[2]];

					for (let d = 3; d < allColorIndexes.length; ++d) {
						[allColorIndexes[3], allColorIndexes[d]] = [allColorIndexes[d], allColorIndexes[3]];
						this.#allCombinationIndexes.push([allColorIndexes[0], allColorIndexes[1], allColorIndexes[2], allColorIndexes[3]]);
						[allColorIndexes[3], allColorIndexes[d]] = [allColorIndexes[d], allColorIndexes[3]];
					}

					[allColorIndexes[2], allColorIndexes[c]] = [allColorIndexes[c], allColorIndexes[2]];
				}

				[allColorIndexes[1], allColorIndexes[b]] = [allColorIndexes[b], allColorIndexes[1]];
			}

			[allColorIndexes[0], allColorIndexes[a]] = [allColorIndexes[a], allColorIndexes[0]];
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
		this.#variantsLeft = this.#variantsLeft.filter((possibleColors, index) => {
			let exactMatches = 0;
			let nonExactMatches = 0;

			for (let i = 0; i < 4; ++i) {
				if (guessedColors[i] === possibleColors[i]) {
					++exactMatches;
				} else if (possibleColors.includes(guessedColors[i])) {
					++nonExactMatches;
				}
			}

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
