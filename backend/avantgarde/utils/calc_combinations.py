import ipdb
import math
from avantgarde.models import RawVerse
from avantgarde.utils.rand_verse import RandVerse


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
