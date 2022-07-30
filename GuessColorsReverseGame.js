import { StorageUtil } from "./StorageUtil.js";

export class GuessColorsReverseGame {
	#allColors = [];
	#allowRepeat = false;
	#colorsCount = 4;
	#wasmInstance = null;
	#variantsLeft = 0;
	#firstGuessSuggestion = [];
	static #wasmModule;

	constructor(allColors, allowRepeat = false, colorsCount = 4) {
		this.#allColors = [...allColors];
		this.#allowRepeat = allowRepeat;
		this.#colorsCount = colorsCount;

		try {
			this.#init();
		} catch (e) {
			console.error(e);
			StorageUtil.clearData();
			document.location.reload();
		}
	}
	#init() {
		const memory = new WebAssembly.Memory({ initial: 2, maximum: 65536 });
		const importObject = {
			env: {
				memory,
				transferData: (variantsLeft, guessSuggestionColorIndex, position) => {
					this.#variantsLeft = variantsLeft;

					if (variantsLeft) {
						this.#firstGuessSuggestion[position] = this.#allColors[guessSuggestionColorIndex];
					} else {
						this.#firstGuessSuggestion = [];
					}
				},
				growMem: (size) => {
					memory.grow(Math.ceil(size / 65536));
				},
				getRandomNumber: (number) => {
					return Math.floor(Math.random() * number);
				},
				debugPrint: (number) => {
					console.log(number);
				}
			}
		};
		this.#wasmInstance = new WebAssembly.Instance(this.constructor.#wasmModule, importObject);
		this.#wasmInstance.exports.init(this.#colorsCount, this.#allColors.length, this.#allowRepeat);
	}

	static async loadWasmModule() {
		if (this.#wasmModule === undefined) {
			this.#wasmModule = null;
			const response = await fetch('./ReverseGame.wasm');
			this.#wasmModule = new WebAssembly.Module(await response.arrayBuffer());
		} else {
			throw 'Loading twice';
		}
	}

	newGame() {
		this.#wasmInstance.exports.newGame();
		this.#allColors.sort(() => Math.random() - 0.5);
		console.log('%c____________________________Starting new game_______________________________',
			'font-size: 20px; font-weight: bold;');
		console.log('Total variants: %c' + this.#variantsLeft, 'font-size: 20px; font-weight: bold;');

	}

	get guessedColors() {
		return this.#firstGuessSuggestion;
	}

	get guessed() {
		return this.#variantsLeft === 1;
	}

	get error() {
		return !this.#variantsLeft;
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

		guessedColors.map(color => this.#allColors.indexOf(color)).forEach((c, i) => {
			this.#wasmInstance.exports.transferHintFromJs(coorectPos, incorrectPos, i, c);
		});


		console.log('Variants left after the hint: %c' + this.#variantsLeft,
			'font-size: 20px; font-weight: bold;' + (
				this.#variantsLeft <= 1 ?
					`color: ${this.#variantsLeft === 0 ? 'red' : 'green'}` :
					''
			)
		);
	}
}
