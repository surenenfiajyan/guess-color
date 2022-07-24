export class StorageUtil {
	static #AVAILABLE_COLORS_KEY = 'availableColors';
	static #ALLOW_DUPLICATES_KEY = 'allowDuplicates';
	static #CURRENT_GAME_TYPE_KEY = 'currentGameType';
	static #GAMES_WON_KEY = 'gamesWon';
	static #TOTAL_ATTEMPTS_KEY = 'totalAttempts';
	static #BEST_ATTEMPTS_KEY = 'bestAttempts';
	static #COLORS_COUNT_KEY = 'colorsCount';

	static saveAvailableColors(colors) {
		this.#saveData(this.#AVAILABLE_COLORS_KEY, colors);
	}

	static getAvailableColors(defaultColors = []) {
		return this.#getData(this.#AVAILABLE_COLORS_KEY, defaultColors);
	}

	static saveAllowDuplicates(allowDuplicates) {
		this.#saveData(this.#ALLOW_DUPLICATES_KEY, allowDuplicates);
	}

	static getAllowDuplicates(defaultAllowDuplicates = false) {
		return this.#getData(this.#ALLOW_DUPLICATES_KEY, defaultAllowDuplicates);
	}

	static saveCurrentGameType(type) {
		this.#saveData(this.#CURRENT_GAME_TYPE_KEY, type);
	}

	static getCurrentGameType(defaultGameType = 'normal') {
		return this.#getData(this.#CURRENT_GAME_TYPE_KEY, defaultGameType);
	}

	static saveGamesWon(gamesWon) {
		this.#saveData(this.#GAMES_WON_KEY, gamesWon);
	}

	static getGamesWon(defaultGamesWon = 0) {
		return this.#getData(this.#GAMES_WON_KEY, defaultGamesWon);
	}

	static saveTotalAttempts(totlaAttempts) {
		this.#saveData(this.#TOTAL_ATTEMPTS_KEY, totlaAttempts);
	}

	static getTotalAttempts(defaultTotalAttempts = 0) {
		return this.#getData(this.#TOTAL_ATTEMPTS_KEY, defaultTotalAttempts);
	}

	static saveBestAttempts(bestAttempts) {
		this.#saveData(this.#BEST_ATTEMPTS_KEY, bestAttempts);
	}

	static getBestAttempts(defaultBestAttempts = 0) {
		return this.#getData(this.#BEST_ATTEMPTS_KEY, defaultBestAttempts);
	}

	static saveColorsCount(colorsCount) {
		this.#saveData(this.#COLORS_COUNT_KEY, colorsCount);
	}

	static getColorsCount(defaultColorsCount = 4) {
		return this.#getData(this.#COLORS_COUNT_KEY, defaultColorsCount);
	}

	static #saveData(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	static #getData(key, defaultValue = null) {
		let result = defaultValue;

		try {
			const data = localStorage.getItem(key);

			if (data !== null) {
				result = JSON.parse(data);
			}
		} catch (e) {
			console.error(e);
		}

		return result;
	}
}