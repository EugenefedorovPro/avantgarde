import re
import random
from avantgarde.models import RawVerse

BR_INTERVAL = 5

class RandVerse:

    def select_word(self, text: str) -> str:
        words = re.findall(r"[^\W\d_]+", text, flags=re.UNICODE)
        word = random.choices(words)[0]
        word = word.lower()
        return word

    def add_br(self, order_word: dict[str, str]):
        br_order_word = {}
        for i, (order, word) in enumerate(order_word.items()):
            if i > 0 and i % BR_INTERVAL == 0:
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
