#define MAX_PEGS 8
#define MAX_COLORS 16

static unsigned pegsCount, allColors, allCombinations, combinationsLeft;
static bool allowDuplicates;

struct ColorCombination
{
	char array[MAX_PEGS];
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
	for (int i = 0; i < pegsCount; ++i)
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
		auto arr = allCombinations == combinationsLeft ? allCombinationsArr : combinationsLeftArr;

		if (colorIndex < pegsCount - 1)
		{
			return;
		}

		int index = -1;

		for (int i = 0; i < combinationsLeft; ++i)
		{
			int exactMatches = 0, nonExactMatches = 0;
			char aColors[MAX_COLORS] = {}, bColors[MAX_COLORS] = {};

			for (int j = 0; j < pegsCount; ++j)
			{
				int a = arr[i].array[j];
				int b = hint.array[j];

				if (a == b)
				{
					++exactMatches;
				}
				else
				{
					if (bColors[a])
					{
						++nonExactMatches;
						--bColors[a];
					}
					else
					{
						aColors[a]++;
					}

					if (aColors[b])
					{
						++nonExactMatches;
						--aColors[b];
					}
					else
					{
						bColors[b]++;
					}
				}
			}

			if (exactMatches == correctPositions && nonExactMatches == incorrectPositions)
			{
				combinationsLeftArr[++index] = arr[i];
			}
		}

		combinationsLeft = index + 1;
		swapRandomly();
		transferDataToJs();
	}

	void init(unsigned colorsPerRow, unsigned totalColors, bool allowRepeats)
	{
		pegsCount = colorsPerRow <= MAX_PEGS ? colorsPerRow : MAX_PEGS;
		allColors = totalColors <= MAX_COLORS ? totalColors : MAX_COLORS;
		allowDuplicates = allowRepeats;

		int uniqueCombinations = 1, repeatableCombinations = 1;

		for (int i = 0, mutiplier = allColors; i < pegsCount; ++i, --mutiplier)
		{
			repeatableCombinations *= allColors;
			uniqueCombinations *= mutiplier;
		}

		allCombinations = allowRepeats ? repeatableCombinations : uniqueCombinations;

		allCombinationsArr = new ColorCombination[allCombinations];
		combinationsLeftArr = new ColorCombination[allCombinations];

		if (allowRepeats)
		{
			for (int i = 0; i < pegsCount; ++i)
			{
				allCombinationsArr[0].array[i] = 0;
			}

			for (int i = 1; i < allCombinations; ++i)
			{
				int carry = 1;

				for (int j = 0; j < pegsCount; ++j)
				{
					int n = allCombinationsArr[i - 1].array[j] + carry;

					if (n >= allColors)
					{
						n = 0;
					}
					else
					{
						carry = 0;
					}

					allCombinationsArr[i].array[j] = n;
				}
			}
		}
		else
		{
			for (int i = 0; i < allCombinations; ++i)
			{
				int number = i;
				char allColorsArr[MAX_COLORS];

				for (int j = 0; j < allColors; ++j)
				{
					allColorsArr[j] = j;
				}

				for (int j = 0, divider = allColors; j < pegsCount; ++j, --divider)
				{
					int index = number % divider;
					allCombinationsArr[i].array[j] = allColorsArr[index];
					allColorsArr[index] = allColorsArr[divider - 1];
					number /= divider;
				}
			}
		}
	}

	void newGame()
	{
		combinationsLeft = allCombinations;
		swapRandomly();
		combinationsLeftArr[0] = allCombinationsArr[0];
		transferDataToJs();
	}
}
