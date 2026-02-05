import ipdb
import math
from avantgarde.models import RawVerse
from avantgarde.utils.rand_verse import RandVerse

SECONDS_PER_YEAR = 31_557_600
AGE_OF_UNIVERSE_YEARS = 13_800_000_000


class CalcCombinations:

    def __init__(self):
        self.r_verse: RandVerse = RandVerse()

    def get_number_words_in_verses(self) -> list[int]:
        texts = RawVerse.objects.values_list("text", flat=True)
        number_words: list[int] = []
        for text in texts:
            cleaned: list[str] = self.r_verse.clean_text(text)
            number_words.append(len(cleaned))
        return number_words

    def calc_combinations(self) -> int:
        number_words = self.get_number_words_in_verses()
        combinations: int = math.prod(number_words)
        return combinations

    def calc_times_longer_than_universe(self) -> str:
        combinations = self.calc_combinations()

        seconds_in_universe_lifetime = (
            SECONDS_PER_YEAR * AGE_OF_UNIVERSE_YEARS
        )

        times = combinations // seconds_in_universe_lifetime

        return f"{times:,}"
