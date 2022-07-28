static unsigned colorsCount, allColors, allCombinations, combinationsLeft;
static bool allowDuplicates;

struct ColorCombination
{
	char array[16];
};

static ColorCombination hint;
static ColorCombination *allCombinationsArr, *combinationsLeftArr;

extern unsigned char __heap_base;
static unsigned bump_pointer = reinterpret_cast<unsigned>(&__heap_base);

extern "C"
{
	extern void growMem(unsigned size);
	extern void transferData(unsigned variantsLeft, unsigned colorIndex, unsigned position);
	extern int getRandomNumber(int number);
	extern void debugPrint(int number);
}

static void *allocate(unsigned long size)
{
	unsigned int r = bump_pointer;
	bump_pointer += size;
	growMem(size);
	return reinterpret_cast<void *>(r);
}

static void transferDataToJs()
{
	for (int i = 0; i < colorsCount; ++i)
	{
		transferData(combinationsLeft, combinationsLeftArr[0].array[i], i);
	}
}

void *operator new(unsigned long size)
{
	return allocate(size);
}

void *operator new[](unsigned long size)
{
	return allocate(size);
}

static void swapRandomly()
{
	int r1 = getRandomNumber(combinationsLeft);
	auto temp1 = combinationsLeftArr[0];
	combinationsLeftArr[0] = combinationsLeftArr[r1];
	combinationsLeftArr[r1] = temp1;

	int r2 = getRandomNumber(allCombinations);
	auto temp2 = allCombinationsArr[0];
	allCombinationsArr[0] = allCombinationsArr[r2];
	allCombinationsArr[r2] = temp2;
}

extern "C"
{
	void transferHintFromJs(unsigned correctPositions, unsigned incorrectPositions, unsigned colorIndex, unsigned color)
	{
		hint.array[colorIndex] = color;

		if (colorIndex < colorsCount - 1)
		{
			return;
		}

		int index = -1;

		for (int i = 0; i < combinationsLeft; ++i)
		{
			int exactMatches = 0, nonExactMatches = 0;
			char aColors[16] = {}, bColors[16] = {};

			for (int j = 0; j < colorsCount; ++j)
			{
				int a = combinationsLeftArr[i].array[j];
				int b = hint.array[j];

				if (a == b)
				{
					++exactMatches;
				}
				else
				{
					aColors[a]++;
					bColors[b]++;

					if (bColors[a])
					{
						++nonExactMatches;
						--aColors[a];
						--bColors[a];
					}

					if (aColors[b])
					{
						++nonExactMatches;
						--aColors[b];
						--bColors[b];
					}
				}
			}

			if (exactMatches == correctPositions && nonExactMatches == incorrectPositions)
			{
				++index;

				if (index < i)
				{
					combinationsLeftArr[index] = combinationsLeftArr[i];
				}
			}
		}

		combinationsLeft = index + 1;
		swapRandomly();
		transferDataToJs();
	}

	void init(unsigned colorsPerRow, unsigned totalColors, bool allowRepeats)
	{
		colorsCount = colorsPerRow;
		allColors = totalColors;
		allowDuplicates = allowRepeats;

		int uniqueCombinations = 1, repeatableCombinations = 1;

		for (int i = 0, mutiplier = allColors; i < colorsCount; ++i)
		{
			repeatableCombinations *= allColors;
			uniqueCombinations *= mutiplier;
			--mutiplier;
		}

		allCombinations = allowRepeats ? repeatableCombinations : uniqueCombinations;

		allCombinationsArr = new ColorCombination[allCombinations];
		combinationsLeftArr = new ColorCombination[allCombinations];

		for (int i = 0, index = 0; index < allCombinations; ++i)
		{
			int number = i;
			bool duplicateMap[] = {false, false, false, false, false, false, false, false, false, false,
								   false, false, false, false, false, false};
			bool duplicate = false;

			for (int j = 0; j < colorsCount; ++j)
			{
				int reminder = number % allColors;
				allCombinationsArr[index].array[j] = reminder;
				number /= allColors;
				duplicate |= duplicateMap[reminder];
				duplicateMap[reminder] = true;
			}

			if (!duplicate || allowDuplicates)
			{
				++index;
			}
		}
	}

	void newGame()
	{
		for (int i = 0; i < allCombinations; ++i)
		{
			combinationsLeftArr[i] = allCombinationsArr[i];
		}

		combinationsLeft = allCombinations;
		swapRandomly();
		transferDataToJs();
	}
}
