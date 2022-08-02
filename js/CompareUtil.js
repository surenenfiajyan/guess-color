export class CompareUtil {
	static getComparisonData(selectedItems, correctSelection) {
		let exactMatches = 0, nonExactMatches = 0;
		const excludedIndexes = new Set();

		for (let i = 0; i < selectedItems.length; ++i) {
			if (selectedItems[i] === correctSelection[i]) {
				excludedIndexes.add(i);
				++exactMatches;
			}
		}

		for (let i = 0; i < selectedItems.length; ++i) {
			if (selectedItems[i] !== correctSelection[i]) {
				const index = correctSelection.findIndex((item, idx) => !excludedIndexes.has(idx) && item === selectedItems[i]);

				if (index !== -1) {
					excludedIndexes.add(index);
					++nonExactMatches;
				}
			}
		}

		return { exactMatches, nonExactMatches };
	}
}