import { CompareUtil } from './CompareUtil.js';
import { GuessColorsReverseGame } from './GuessColorsReverseGame.js';
import { SettingsPopup } from './SettingsPopup.js';
import { StorageUtil } from './StorageUtil.js';

export class GuessColorsGame {
	#bestNumberOfAttempts = StorageUtil.getBestAttempts();
	#allAttempts = StorageUtil.getTotalAttempts();
	#currentNumberOfAttempts = 0;
	#gamesWon = StorageUtil.getGamesWon();
	#possibleColors = ['red', 'green', 'blue', 'yellow', 'pink', 'indigo', 'aqua', 'orange', 'brown', 'black'];
	#allColors = StorageUtil.getAvailableColors([...this.#possibleColors]);
	#colorsToGuess = [];
	#selectedColors = [];
	#currentGameType = StorageUtil.getCurrentGameType();
	#allowRepeatingColors = StorageUtil.getAllowDuplicates(false);
	#colorsCount = StorageUtil.getColorsCount();

	// elements
	#newGameButton = document.getElementById('newGame');
	#gameTypeSwitch = document.getElementById('gameType');
	#tryColorsButton = document.getElementById('guessColors');
	#tryColorsForMeButton = document.getElementById('guessColorsForMe');
	#colorsToSelectContainer = document.getElementById('colorsToSelect');
	#colorsHintContainer = document.getElementById('colorHintsToSelect');
	#attemptedColorsContainer = document.getElementById('attemptedColorsContainer');
	#errorMessage = document.getElementById('errorMessage');
	#victoryPopup = document.getElementById('victoryPopup');
	#victoryPopupMessage = document.getElementById('victoryMessage');
	#gameStatistics = document.getElementById('gameStatistics');
	#gamesPlayedText = document.getElementById('gamesPlayed');
	#averageNumberOfAttemptsText = document.getElementById('averageGuesses');
	#bestNumberOfAttemptsText = document.getElementById('bestNumberOfGuesses');
	#normalGameTitle = document.getElementById('normalGameTitle');
	#reverseGameTitle = document.getElementById('reverseGameTitle');
	#reverseGameUniqueWord = document.getElementById('reverseGameUniqueWord');
	#colorsNumber = document.getElementById('colorsNumber');
	#colorsTemplate = document.getElementById('colorsTemplate');

	// reverse game class
	#reverseGame = null;

	constructor() {
		this.#initSettingsPopup();

		this.#newGameButton.onclick = this.#victoryPopup.onclose = () => {
			this.#newGame();
		}

		this.#tryColorsButton.onclick = () => {
			if (this.#currentGameType === 'normal') {
				this.#tryColors();
			} else {
				const valueElements = this.#colorsHintContainer.getElementsByTagName('select');
				const correctColorsInCorrectPosition = parseInt(valueElements[0].value);
				const correctColors = parseInt(valueElements[1].value);
				this.#getReverseGame().hint(this.#selectedColors, correctColorsInCorrectPosition, correctColors);

				if (this.#getReverseGame().guessed) {
					--this.#currentNumberOfAttempts;
				}

				this.#tryColorsForMe();
			}
		}

		this.#tryColorsForMeButton.onclick = () => {
			this.#currentNumberOfAttempts += 4;
			this.#tryColorsForMe();
		}

		this.#gameTypeSwitch.onchange = (ev) => {
			StorageUtil.saveCurrentGameType(ev.target.value);
			this.#newGameButton.innerText = ev.target.value === 'normal' ? 'New game' : 'New solver game';
		}

		this.#gameTypeSwitch.value = this.#currentGameType;
		this.#gameTypeSwitch.dispatchEvent(new Event('change'));
		this.#reverseGameUniqueWord.style.display = this.#allowRepeatingColors ? 'none' : '';
		this.#colorsNumber.innerText = this.#colorsCount;

		this.#setMenus();
		this.#setColorOptions();
		this.#initDrag();
		this.#newGame();
	}

	#getReverseGame() {
		if (this.#currentGameType === 'reverse' || this.#tryColorsForMeButton.style.display !== 'none') {
			if (!this.#reverseGame) {
				this.#reverseGame = new GuessColorsReverseGame(this.#allColors, this.#allowRepeatingColors, this.#colorsCount);
			}
		} else {
			this.#reverseGame = null;
		}
		

		return this.#reverseGame;
	}

	#initSettingsPopup() {
		new SettingsPopup(this.#possibleColors, this.#allColors, this.#allowRepeatingColors, this.#colorsCount, (allColors, allowRepeat, colorsCount) => {
			this.#allColors = allColors;
			this.#allowRepeatingColors = allowRepeat;
			this.#colorsCount = colorsCount;
			StorageUtil.saveAvailableColors(allColors);
			StorageUtil.saveAllowDuplicates(allowRepeat);
			StorageUtil.saveColorsCount(colorsCount);
			this.#reverseGame = null;
			this.#bestNumberOfAttempts = 0;
			this.#allAttempts = 0;
			this.#gamesWon = 0;
			StorageUtil.saveGamesWon(this.#gamesWon);
			StorageUtil.saveTotalAttempts(this.#allAttempts);
			StorageUtil.saveBestAttempts(this.#bestNumberOfAttempts);
			this.#updateDisplayedGameStatistics();
			this.#reverseGameUniqueWord.style.display = this.#allowRepeatingColors ? 'none' : '';
			this.#colorsNumber.innerText = this.#colorsCount;

			this.#setMenus();
			this.#setColorOptions();
			this.#initDrag();
			this.#newGame();
		});
	}

	#setMenus() {
		this.#colorsToSelectContainer.replaceChildren();
		this.#colorsToSelectContainer.style.gap = (100 / this.#colorsCount / this.#colorsCount) + '%';

		for (let i = 0; i < this.#colorsCount; ++i) {
			this.#colorsToSelectContainer.appendChild(document.importNode(this.#colorsTemplate.content, true));
		}

		this.#colorsHintContainer.querySelectorAll('select').forEach((menuEl) => {
			let html = '<option value="0">None</option>';

			for (let k = 1; k <= this.#colorsCount; ++k) {
				html += `<option value="${k}">${k}</option>`;
			}

			menuEl.innerHTML = html;
		});

		this.#colorsToSelectContainer.querySelectorAll('dialog').forEach((menuEl) => {
			menuEl.parentElement.onclick = menuEl.parentElement.onkeydown = (ev) => {
				if (ev.type === 'click' || ev.type === 'keydown' && (['ArrowUp', 'ArrowDown', 'Enter', 'Spacebar', ' '].includes(ev.key))) {
					const modalEl = ev.currentTarget.firstElementChild;

					if (!modalEl.open) {
						modalEl.style.top = ev.currentTarget.offsetTop + ev.currentTarget.offsetHeight - 70 - 17 * this.#allColors.length + 'px';
						modalEl.style.left = `calc(${ev.currentTarget.offsetLeft - (window.innerWidth + Math.max(100 - ev.currentTarget.offsetWidth, 0)) / 2}px + 50vw)`;
						modalEl.style.width = `${Math.max(ev.currentTarget.offsetWidth, 100)}px`;
						modalEl.showModal();
						(modalEl.querySelector(`button[data-color="${ev.currentTarget.style.background}"]`) ?? modalEl.firstElementChild).focus();
						ev.preventDefault();
					}
				} else if (ev.type === 'keydown') {
					let elementToFocus;

					if (ev.key === 'ArrowLeft') {
						elementToFocus = ev.currentTarget.previousElementSibling ?? ev.currentTarget.parentElement.lastElementChild;
					} else if (ev.key === 'ArrowRight') {
						elementToFocus = ev.currentTarget.nextElementSibling ?? ev.currentTarget.parentElement.firstElementChild;
					}

					elementToFocus?.focus();
				}
			}

			menuEl.onclick = (ev) => {
				const optionButton = ev.target.closest('.option');
				const selectedColor = optionButton?.dataset.color ?? '';

				if (!selectedColor && ev.currentTarget.clientWidth < 150) {
					const colorElement = ev.target.closest('.color');
					const x = ev.clientX;
					const y = ev.clientY;

					setTimeout(() => {
						const elementUnderPointer = document.elementFromPoint(x, y);

						if (elementUnderPointer !== colorElement) {
							elementUnderPointer?.click();
						}
					}, 50);
				}

				ev.currentTarget.close(selectedColor);
				ev.stopPropagation();
			}

			menuEl.onkeydown = (ev) => {
				ev.stopPropagation();
			}

			menuEl.onclose = (ev) => {
				if (ev.target.returnValue) {
					ev.target.parentElement.style.background = ev.target.returnValue;
					ev.target.parentElement.focus();
				}
			}
		});
	}

	#setColorOptions() {
		this.#reverseGameTitle.querySelector('em').innerHTML = this.#allColors.map(color => `<span style="color: ${color}">${color[0].toUpperCase() + color.substring(1)}</span>`).join(', ');

		this.#colorsToSelectContainer.querySelectorAll('dialog').forEach(menuEl => {
			menuEl.replaceChildren();

			for (const color of this.#allColors) {
				const optionEl = document.createElement('button');
				optionEl.className = 'option';
				optionEl.dataset.color = color;
				optionEl.style.setProperty('--color', color);
				optionEl.innerText = color[0].toUpperCase() + color.substring(1);

				optionEl.onkeydown = (ev) => {
					let elementToFocus;

					if (['ArrowUp', 'ArrowLeft'].includes(ev.key)) {
						elementToFocus = ev.currentTarget.previousElementSibling ?? ev.currentTarget.parentElement.lastElementChild;
						ev.preventDefault();
					}

					if (['ArrowDown', 'ArrowRight'].includes(ev.key)) {
						elementToFocus = ev.currentTarget.nextElementSibling ?? ev.currentTarget.parentElement.firstElementChild;
						ev.preventDefault();
					}

					elementToFocus?.focus();
				}

				menuEl.appendChild(optionEl);
			}
		});
	}

	#updateDisplayedGameStatistics() {
		const averageNumberOfAttempts = this.#gamesWon ? (this.#allAttempts / this.#gamesWon).toFixed(2) : null;

		this.#averageNumberOfAttemptsText.innerText = averageNumberOfAttempts ? averageNumberOfAttempts : '--';
		this.#gamesPlayedText.innerText = this.#gamesWon;
		this.#bestNumberOfAttemptsText.innerText = this.#gamesWon > 0 ? this.#bestNumberOfAttempts : '--';

		return averageNumberOfAttempts;
	}

	#initDrag() {
		let offsetUnit;
		const mapping = new Map();
		let oldIndex, newIndex;

		this.#colorsToSelectContainer.querySelectorAll('.color').forEach((el, i) => {
			mapping.set(i, el);
			mapping.set(el, i);

			el.ondragstart = (ev) => {
				ev.currentTarget.parentElement.classList.add('drag');
				offsetUnit = mapping.get(1).offsetLeft - mapping.get(0).offsetLeft;
				oldIndex = newIndex = mapping.get(ev.currentTarget);

				if (ev.dataTransfer) {
					ev.dataTransfer.effectAllowed = "move";
				}
			};

			el.ondragover = (ev) => {
				ev.dataTransfer.effectAllowed = "move";
				ev.preventDefault();
			};

			el.ondragenter = (ev) => {
				const draggableElement = mapping.get(oldIndex);
				if (draggableElement !== ev.currentTarget) {
					const targetIndex = mapping.get(ev.currentTarget);

					if (targetIndex <= newIndex && targetIndex > oldIndex) {
						newIndex = targetIndex - 1;
					} else if (targetIndex >= newIndex && targetIndex < oldIndex) {
						newIndex = targetIndex + 1;
					} else {
						newIndex = targetIndex;
					}

					draggableElement.style.transform = `translateX(${(newIndex - oldIndex) * offsetUnit}px)`;

					for (const key of mapping.keys()) {
						if (typeof key === 'number' && key !== oldIndex) {
							let offset = 0;

							if (key <= newIndex && key > oldIndex) {
								offset = -offsetUnit;
							} else if (key >= newIndex && key < oldIndex) {
								offset = offsetUnit;
							}

							mapping.get(key).style.transform = `translateX(${offset}px)`;
						}
					}
				}

				ev.preventDefault();
			};

			el.ondragend = (ev) => {
				const colorsRow = ev.currentTarget.parentElement;
				setTimeout(() => colorsRow.classList.remove('drag'), 220);

				function removeOffset(el) {
					el.style.transform = 'translateX(0)';
					setTimeout(() => el.style.transform = '', 220);
				}

				for (const colorEl of mapping.keys()) {
					if (colorEl instanceof HTMLElement) {
						removeOffset(colorEl);
					}
				}
			};

			el.ondrop = (ev) => {
				const increment = oldIndex < newIndex ? 1 : -1;
				const color = mapping.get(oldIndex).style.background;

				while (oldIndex !== newIndex) {
					mapping.get(oldIndex).style.background = mapping.get(oldIndex + increment).style.background;
					oldIndex += increment;
				}

				mapping.get(newIndex).style.background = color;
				ev.currentTarget.parentElement.classList.remove('drag');
			};

			this.#initMobileDrag(el);
		});
	}

	#initMobileDrag(colorElement) {
		let elementTouchingOver;

		colorElement.ontouchstart = (ev) => {
			elementTouchingOver = null;
			const dragStartEvent = new Event('dragstart');
			ev.currentTarget.dispatchEvent(dragStartEvent);
		};

		colorElement.ontouchend = (ev) => {
			const dragEndEvent = new Event('dragend');
			ev.currentTarget.dispatchEvent(dragEndEvent);

			if (elementTouchingOver) {
				const dropEvent = new Event('drop');
				elementTouchingOver.dispatchEvent(dropEvent);
			}
		};

		colorElement.ontouchmove = (ev) => {
			const newElementTouchingOver = document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY)?.closest('.color');

			if (newElementTouchingOver && elementTouchingOver !== newElementTouchingOver) {
				const dragEnterEvent = new Event('dragenter');
				newElementTouchingOver.dispatchEvent(dragEnterEvent);
			}

			elementTouchingOver = newElementTouchingOver;
		};

		colorElement.ontouchcancel = (ev) => {
			const dragEndEvent = new Event('dragend');
			ev.currentTarget.dispatchEvent(dragEndEvent);
		};
	}

	#newGame() {
		this.#currentGameType = this.#gameTypeSwitch.value;
		this.#currentNumberOfAttempts = 0;
		this.#attemptedColorsContainer.innerText = '';
		this.#errorMessage.innerText = '';
		this.#tryColorsButton.innerText = this.#currentGameType === 'normal' ? 'Try' : 'Submit hint';
		this.#normalGameTitle.style.display = this.#colorsToSelectContainer.style.display = this.#currentGameType === 'normal' ? '' : 'none';
		this.#reverseGameTitle.style.display = this.#colorsHintContainer.style.display = this.#currentGameType === 'reverse' ? '' : 'none';
		this.#selectedColors.length = 0;
		this.#colorsToGuess.length = 0;

		if (this.#currentGameType === 'normal') {
			this.#attemptedColorsContainer.classList.add('opacity');
		} else {
			this.#attemptedColorsContainer.classList.remove('opacity');
		}

		const averageNumberOfAttempts = this.#updateDisplayedGameStatistics();
		this.#tryColorsForMeButton.style.display = (this.#currentGameType === 'normal' && averageNumberOfAttempts < 10 && this.#gamesWon >= 10) ? '' : 'none';
		this.#gameStatistics.style.display = this.#currentGameType === 'normal' ? '' : 'none';

		if (this.#currentGameType === 'normal') {
			this.#colorsToSelectContainer.querySelectorAll('.color').forEach((colorEl) => {
				colorEl.style.background = '';
			});

			for (let i = this.#allColors.length; i > 1; --i) {
				const randomIndex = Math.floor(Math.random() * i);
				[this.#allColors[i - 1], this.#allColors[randomIndex]] = [this.#allColors[randomIndex], this.#allColors[i - 1]];
			}

			if (this.#allowRepeatingColors) {
				this.#colorsToGuess = [];

				for (let i = 0; i < this.#colorsCount; ++i) {
					this.#colorsToGuess.push(this.#allColors[Math.floor(Math.random() * this.#allColors.length)]);
				}
			} else {
				this.#colorsToGuess = this.#allColors.slice(0, this.#colorsCount);
			}

			this.#getReverseGame()?.newGame();
		} else {
			this.#getReverseGame().newGame();
			this.#tryColorsForMe();
		}
	}

	#storeSelectedColors() {
		this.#selectedColors.length = 0;

		this.#colorsToSelectContainer.querySelectorAll('.color').forEach((colorEl) => {
			if (colorEl.style.backgroundColor) {
				this.#selectedColors.push(colorEl.style.backgroundColor);
			}
		});
	}

	#getErrorMessage() {
		let message = '';

		this.#storeSelectedColors();

		if (this.#selectedColors.length < this.#colorsCount) {
			message += "Please select all colors";
		} else {
			if (!this.#allowRepeatingColors && this.#selectedColors.find((color, i, arr) => i !== arr.indexOf(color))) {
				message += "The colors shouldn't repeat";
			}
		}

		return message;
	}

	#getComparisonMessage() {
		const { exactMatches, nonExactMatches } = CompareUtil.getComparisonData(this.#selectedColors, this.#colorsToGuess);
		let message = '';

		if (exactMatches !== this.#colorsCount) {
			if (!nonExactMatches && !exactMatches) {
				message += `<span class="group">There is not even a correct color</span>`;
			} else {
				if (exactMatches) {
					message += `<span class="group correct">Correct colors and correct positions: ${exactMatches}</span>`;
				}

				if (nonExactMatches) {
					message += `<span class="group">Correct colors but wrong positions: ${nonExactMatches}</span>`;
				}
			}
		}

		this.#getReverseGame()?.hint(this.#selectedColors, exactMatches, nonExactMatches);
		return message;
	}

	#tryColors() {
		const message = this.#getErrorMessage();
		this.#errorMessage.innerText = message;

		if (!message) {
			++this.#currentNumberOfAttempts;
			const selectedColors = this.#colorsToSelectContainer.cloneNode(true);
			const comparisonMessage = this.#currentGameType === 'normal' ? this.#getComparisonMessage() : '<span class="group">How much of this is correct?</span>';
			selectedColors.id = '';
			selectedColors.style.display = ''
			selectedColors.querySelectorAll('.color').forEach((colorEl) => colorEl.tabIndex = -1);

			this.#attemptedColorsContainer.appendChild(selectedColors);

			if (!comparisonMessage || (this.#currentGameType === 'reverse' && this.#getReverseGame().guessed)) {
				this.#endGame();
			} else {
				const messageEl = document.createElement('span');
				messageEl.className = 'message';
				messageEl.innerHTML = comparisonMessage;
				this.#attemptedColorsContainer.appendChild(messageEl);
				window.scrollTo(0, document.body.scrollHeight);
			}
		}
	}

	#tryColorsForMe() {
		if (this.#getReverseGame().error) {
			this.#endGame(true);
		}

		const selectedColors = this.#getReverseGame().guessedColors;

		this.#colorsToSelectContainer.querySelectorAll('.color').forEach((colorEl, index) => {
			colorEl.style.background = selectedColors[index];
		});

		this.#tryColors();
	}

	#endGame(error = false) {
		if (this.#currentGameType === 'normal') {
			this.#bestNumberOfAttempts = this.#bestNumberOfAttempts ?
				Math.min(this.#bestNumberOfAttempts, this.#currentNumberOfAttempts) :
				this.#currentNumberOfAttempts;
			this.#allAttempts += this.#currentNumberOfAttempts;
			++this.#gamesWon;
			StorageUtil.saveGamesWon(this.#gamesWon);
			StorageUtil.saveTotalAttempts(this.#allAttempts);
			StorageUtil.saveBestAttempts(this.#bestNumberOfAttempts);
		}

		this.#victoryPopupMessage.innerText = error ? 'Looks like there is an error in the hints' :
			`${this.#currentGameType === 'normal' ? 'Congratulations, you' : 'I'} guessed the colors in ${this.#currentNumberOfAttempts > 1 ?
				(this.#currentNumberOfAttempts + ' attempts') : 'one attempt'}!!!`;

		if (this.#currentGameType === 'reverse' && !error) {
			const clonedContent = this.#attemptedColorsContainer.lastElementChild.cloneNode(true);
			clonedContent.querySelectorAll('.color').forEach(el => {
				el.removeAttribute('tabindex');
				el.removeAttribute('draggable');
			});
			clonedContent.querySelectorAll('dialog').forEach(el => el.remove());
			this.#victoryPopupMessage.append(clonedContent);
		}

		this.#victoryPopup.showModal();
	}
}
