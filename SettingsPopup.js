export class SettingsPopup {
	#settingsPopup = document.getElementById('settingsPopup');
	#settingsButton = document.getElementById('settings');
	#allowRepeatingColors = false;
	#allColors = [];
	#possibleColors = [];
	#updateCallback;

	constructor(possibleColors, allColors, allowRepeatingColors, updateCallback) {
		this.#possibleColors = possibleColors;
		this.#allColors = [...allColors];
		this.#allowRepeatingColors = allowRepeatingColors;
		this.#updateCallback = updateCallback;

		this.#settingsButton.onclick = () => {
			let html = '<fieldset>';
			html += '<legend align="center">Use colors:</legend>';
			html += this.#possibleColors.map(color => `<label class="color-setting" style="color: ${color}"><input name="color" value="${color}" type="checkbox" ${this.#allColors.includes(color) ? 'checked' : ''}><span class="checkbox"></span>${color[0].toUpperCase() + color.substring(1)}</label>`).join('');
			html += '</fieldset>';
			html += `<label class="color-setting nowrap"><input name="repeat" type="checkbox" ${this.#allowRepeatingColors ? 'checked' : ''}><span class="checkbox"></span>Allow repeating colors</label>`;
			this.#settingsPopup.querySelector('.settings-form').innerHTML = html;
			this.#disableSettingsDialogCheckboxs();
			this.#settingsPopup.showModal();
		}

		this.#settingsPopup.onchange = () => {
			this.#disableSettingsDialogCheckboxs();
		}

		this.#settingsPopup.onclose = (ev) => {
			if (ev.target.returnValue === 'save') {
				this.#allColors = [...this.#settingsPopup.querySelectorAll('[name="color"]:checked')].map(checkbox => checkbox.value);
				this.#allowRepeatingColors = this.#settingsPopup.querySelector('[name="repeat"]').checked;
				this.#updateCallback(this.#allColors, this.#allowRepeatingColors);
			}
		}
	}

	#disableSettingsDialogCheckboxs() {
		this.#settingsPopup.querySelectorAll('[name="color"]:checked')
			.forEach((checkbox, i, arr) => checkbox.disabled = arr.length <= 4);
	}
}