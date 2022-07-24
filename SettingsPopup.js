export class SettingsPopup {
	#settingsPopup = document.getElementById('settingsPopup');
	#settingsButton = document.getElementById('settings');
	#allowRepeatingColors = false;
	#allColors = [];
	#possibleColors = [];
	#updateCallback;
	#colorsCount = 4;

	constructor(possibleColors, allColors, allowRepeatingColors, colorsCount, updateCallback) {
		this.#possibleColors = possibleColors;
		this.#allColors = [...allColors];
		this.#allowRepeatingColors = allowRepeatingColors;
		this.#updateCallback = updateCallback;
		this.#colorsCount = colorsCount;

		this.#settingsButton.onclick = () => {
			this.#settingsPopup.returnValue = '';
			let html = '<fieldset>';
			html += '<legend align="center">Use colors:</legend>';
			html += this.#possibleColors.map(color => `<label class="color-setting" style="color: ${color}"><input name="color" value="${color}" type="checkbox" ${this.#allColors.includes(color) ? 'checked' : ''}><span class="checkbox"></span>${color[0].toUpperCase() + color.substring(1)}</label>`).join('');
			html += '</fieldset>';

			html += '<fieldset>';
			html += '<legend align="center">Colors number:</legend>';

			for (let k = 4; k <= 8; ++k) {
				html += `<label class="color-setting"><input name="count" type="radio" value="${k}" ${k === this.#colorsCount ? 'checked' : ''}><span class="radio"></span>${k}</label>`;
			}

			html += '</fieldset>';

			html += `<label class="color-setting nowrap"><input name="repeat" type="checkbox" ${this.#allowRepeatingColors ? 'checked' : ''}><span class="checkbox"></span>Allow repeating colors</label>`;
			this.#settingsPopup.querySelector('.settings-form').innerHTML = html;
			this.#enableDisableControls();
			this.#settingsPopup.showModal();
		}

		this.#settingsPopup.onchange = () => {
			this.#enableDisableControls();
		}

		this.#settingsPopup.onclose = (ev) => {
			if (ev.target.returnValue === 'save') {
				this.#allColors = [...this.#settingsPopup.querySelectorAll('[name="color"]:checked')].map(checkbox => checkbox.value);
				this.#allowRepeatingColors = this.#settingsPopup.querySelector('[name="repeat"]').checked;
				this.#colorsCount = +this.#settingsPopup.querySelector('[name="count"]:checked').value;
				this.#updateCallback([...this.#allColors], this.#allowRepeatingColors, this.#colorsCount);
			}
		}
	}

	#enableDisableControls() {
		const selectedColors = this.#settingsPopup.querySelectorAll('[name="color"]:checked');
		selectedColors.forEach((checkbox, i, arr) =>
			checkbox.disabled = arr.length <= +this.#settingsPopup.querySelector('[name="count"]:checked').value);
		this.#settingsPopup.querySelectorAll('[name="count"]').forEach((el) => el.disabled = +el.value > selectedColors.length);
	}
}
