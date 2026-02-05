import re
import random
from avantgarde.models import RawVerse

BR_INTERVAL = 4

class CalcCombinations:

    def calc_combinations(self):
        texts = RawVerse.objects.values_list("text", flat=True)
        pass

class RandVerse:

    def clean_text(self, text: str) -> list[str]:
        return re.findall(r"[^\W\d_]+", text, flags=re.UNICODE)

    def select_word(self, text: str) -> str:
        words = self.clean_text(text)
        word = random.choices(words)[0]
        word = word.lower()
        return word

    def add_br(self, order_word: dict[str, str]):
        br_order_word = {}
        for i, (order, word) in enumerate(order_word.items()):
            if i % BR_INTERVAL == 0:
                br_order_word[order] = word + "  \n"
            else:
                br_order_word[order] = word
        return br_order_word

    def rand_verse(self) -> dict[int, str]:
        verses = RawVerse.objects.all()
        order_word: dict[str, str] = {}
        for verse in verses:
            order_word[verse.order] = self.select_word(verse.text)
        br_order_word = self.add_br(order_word)
        return br_order_word

    def only_words(self) -> str:
        html_words = self.rand_verse()
        new_verse = " ".join(list(html_words.values()))
        return new_verse
