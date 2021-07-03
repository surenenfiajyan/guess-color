import { GuessColorsReverseGame } from './GuessColorsReverseGame.js'

export class GuessColorsGame {
	_bestNumberOfAttempts = 0;
	_allAttempts = 0;
	_currentNumberOfAttempts = 0;
	_gamesWon = 0;
	_allColors = ['red', 'green', 'blue', 'yellow', 'pink', 'indigo', 'aqua', 'orange', 'brown', 'black'];
	_colorsToGuess = [];
	_selectedColors = [];
	_currentGameType = 'normal';

	// elements
	_newGameButton = document.getElementById('newGame');
	_gameTypeSwitch = document.getElementById('gameType');
	_tryColorsButton = document.getElementById('guessColors');
	_tryColorsForMeButton = document.getElementById('guessColorsForMe');
	_colorsToSelectContainer = document.getElementById('colorsToSelect');
	_colorsHintContainer = document.getElementById('colorHintsToSelect');
	_attemptedColorsContainer = document.getElementById('attemptedColorsContainer');
	_errorMessage = document.getElementById('errorMessage');
	_victoryPopup = document.getElementById('victoryPopup');
	_victoryPopupMessage = document.getElementById('victoryMessage');
	_gameStatistics = document.getElementById('gameStatistics');
	_gamesPlayedText = document.getElementById('gamesPlayed');
	_averageNumberOfAttemptsText = document.getElementById('averageGuesses');
	_bestNumberOfAttemptsText = document.getElementById('bestNumberOfGuesses');
	_normalGameTitle = document.getElementById('normalGameTitle');
	_reverseGameTitle = document.getElementById('reverseGameTitle');
	_colorsTemplate = document.getElementById('colorsTemplate');

	// reverse game class
	_reverseGame = new GuessColorsReverseGame(this._allColors);

	constructor() {
		this._newGameButton.onclick = this._victoryPopup.onclose = () => {
			this._newGame();
		}

		this._tryColorsButton.onclick = () => {
			if (this._currentGameType === 'normal') {
				this._tryColors();
			} else {
				const valueElements = this._colorsHintContainer.getElementsByTagName('select');
				const correctColorsInCorrectPosition = parseInt(valueElements[0].value);
				const correctColors = parseInt(valueElements[1].value);
				this._reverseGame.hint(this._selectedColors, correctColorsInCorrectPosition, correctColors);

				if (this._reverseGame.guessed) {
					--this._currentNumberOfAttempts;
				}

				this._tryColorsForMe();
			}
		}

		this._tryColorsForMeButton.onclick = () => {
			this._currentNumberOfAttempts += 4;
			this._tryColorsForMe();
		}

		this._gameTypeSwitch.onchange = (ev) => {
			this._newGameButton.innerText = ev.target.value === 'normal' ? 'New game' : 'New reverse game';
		}

		this._colorsToSelectContainer.appendChild(document.importNode(this._colorsTemplate.content, true));
		this._colorsToSelectContainer.querySelectorAll('dialog').forEach((menuEl, i) => {
			menuEl.parentElement.onclick = menuEl.parentElement.onkeydown = (ev) => {
				if (ev.type === 'click' || ev.type === 'keydown' && (['ArrowUp', 'ArrowDown', 'Enter', 'Spacebar', ' '].includes(ev.key))) {
					const modalEl = ev.currentTarget.firstElementChild;

					if (!modalEl.open) {
						modalEl.style.top = ev.currentTarget.offsetTop - 150 + 'px';
						modalEl.style.left = `calc(${ev.currentTarget.offsetLeft - window.innerWidth / 2}px + 50vw)`;
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
				ev.currentTarget.close(optionButton?.dataset.color ?? '');
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

			for (const color of this._allColors) {
				const optionEl = document.createElement('button');

				if (i === 0) {
					const colorText = document.createElement('span');
					colorText.style.color = color;
					colorText.innerText = color[0].toUpperCase() + color.substring(1);
					this._reverseGameTitle.lastElementChild.innerHTML += this._reverseGameTitle.lastElementChild.children.length ? ', ' : ' ';
					this._reverseGameTitle.lastElementChild.appendChild(colorText);
				}

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

			this._initDrag();
		});

		this._newGame();
	}

	_initDrag() {
		let offsetUnit;
		const mapping = new Map();
		let oldIndex, newIndex;

		this._colorsToSelectContainer.querySelectorAll('.color').forEach((el, i) => {
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
							if (key !== oldIndex) {
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

			this._initMobileDrag(el);
		});
	}

	_initMobileDrag(colorElement) {
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

	_newGame() {
		this._currentGameType = this._gameTypeSwitch.value;
		this._reverseGame.newGame();
		this._currentNumberOfAttempts = 0;
		this._attemptedColorsContainer.innerText = '';
		this._errorMessage.innerText = '';
		this._tryColorsButton.innerText = this._currentGameType === 'normal' ? 'Try' : 'Submit hint';
		this._normalGameTitle.style.display = this._colorsToSelectContainer.style.display = this._currentGameType === 'normal' ? '' : 'none';
		this._reverseGameTitle.style.display = this._colorsHintContainer.style.display = this._currentGameType === 'reverse' ? '' : 'none';
		this._selectedColors.length = 0;
		this._colorsToGuess.length = 0;

		if (this._currentGameType === 'normal') {
			this._attemptedColorsContainer.classList.add('opacity');
		} else {
			this._attemptedColorsContainer.classList.remove('opacity');
		}

		const averageNumberOfAttempts = this._gamesWon ? (this._allAttempts / this._gamesWon).toFixed(2) : null;

		this._averageNumberOfAttemptsText.innerText = averageNumberOfAttempts ? averageNumberOfAttempts : '--';
		this._tryColorsForMeButton.style.display = (this._currentGameType === 'normal' && averageNumberOfAttempts < 10 && this._gamesWon >= 10) ? '' : 'none';
		this._gameStatistics.style.display = this._currentGameType === 'normal' ? '' : 'none';

		if (this._currentGameType === 'normal') {
			this._colorsToSelectContainer.querySelectorAll('.color').forEach((colorEl) => {
				colorEl.style.background = '';
			});

			this._allColors.sort(() => Math.random() - 0.5);
			this._colorsToGuess = this._allColors.slice(0, 4);
		} else {
			this._tryColorsForMe();
		}
	}

	_storeSelectedColors() {
		this._selectedColors.length = 0;

		this._colorsToSelectContainer.querySelectorAll('.color').forEach((colorEl) => {
			if (colorEl.style.background) {
				this._selectedColors.push(colorEl.style.background);
			}
		});
	}

	_getErrorMessage() {
		let message = '';

		this._storeSelectedColors();

		if (this._selectedColors.length < 4) {
			message += "Please select all colors";
		} else {
			if (this._selectedColors.find((color, i, arr) => i !== arr.indexOf(color))) {
				message += "The colors shouldn't repeat";
			}
		}

		return message;
	}

	_getComparisonMessage() {
		let correctColors = 0;
		let correctColorsInCorrectPosition = 0;

		for (let i = 0; i < 4; ++i) {
			if (this._selectedColors[i] === this._colorsToGuess[i]) {
				++correctColorsInCorrectPosition;
			} else if (this._colorsToGuess.includes(this._selectedColors[i])){
				++correctColors;
			}
		}

		let message = '';

		if (correctColorsInCorrectPosition !== 4) {
			if (!correctColors && !correctColorsInCorrectPosition) {
				message += `<span class="group">There is not even a correct color</span>`;
			} else {
				if (correctColorsInCorrectPosition) {
					message += `<span class="group correct">Correct colors and correct positions: ${correctColorsInCorrectPosition}</span>`;
				}

				if (correctColors) {
					message += `<span class="group">Correct colors but wrong positions: ${correctColors}</span>`;
				}
			}
		}

		this._reverseGame.hint(this._selectedColors, correctColorsInCorrectPosition, correctColors);
		return message;
	}

	_tryColors() {
		const message = this._getErrorMessage();
		this._errorMessage.innerText = message;

		if (!message) {
			++this._currentNumberOfAttempts;
			const selectedColors = this._colorsToSelectContainer.cloneNode(true);
			const comparisonMessage = this._currentGameType === 'normal' ? this._getComparisonMessage() : '<span class="group">How much of this is correct?</span>';
			selectedColors.id = '';
			selectedColors.style.display = ''
			selectedColors.querySelectorAll('.color').forEach((colorEl) => colorEl.tabIndex = -1);

			this._attemptedColorsContainer.appendChild(selectedColors);

			if (!comparisonMessage || (this._currentGameType === 'reverse' && this._reverseGame.guessed)) {
				this._endGame();
			} else {
				const messageEl = document.createElement('span');
				messageEl.className = 'message';
				messageEl.innerHTML = comparisonMessage;
				this._attemptedColorsContainer.appendChild(messageEl);
				window.scrollTo(0, document.body.scrollHeight);
			}
		}
	}

	_tryColorsForMe() {
		if (this._reverseGame.error) {
			this._endGame(true);
		}

		const selectedColors = this._reverseGame.guessedColors;

		this._colorsToSelectContainer.querySelectorAll('.color').forEach((colorEl, index) => {
			colorEl.style.background = selectedColors[index];
		});

		this._tryColors();
	}

	_endGame(error = false) {
		if (this._currentGameType === 'normal') {
			this._bestNumberOfAttempts = this._bestNumberOfAttempts ?
				Math.min(this._bestNumberOfAttempts, this._currentNumberOfAttempts) :
				this._currentNumberOfAttempts;
			this._allAttempts += this._currentNumberOfAttempts;
			++this._gamesWon;
			this._gamesPlayedText.innerText = this._gamesWon;
			this._bestNumberOfAttemptsText.innerText = this._bestNumberOfAttempts;
		}

		this._victoryPopupMessage.innerText = error ? 'Looks like there is an error in the hints' :
			`${this._currentGameType === 'normal' ? 'Congratulations, you' : 'I'} guessed the colors in ${this._currentNumberOfAttempts > 1 ?
			(this._currentNumberOfAttempts + ' attempts') : 'one attempt'}!!!`;

		if (this._currentGameType === 'reverse' && !error) {
			this._victoryPopupMessage.innerHTML += this._attemptedColorsContainer.lastElementChild.outerHTML;
		}

		this._victoryPopup.showModal();
	}
}
