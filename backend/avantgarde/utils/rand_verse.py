import re
import random
from avantgarde.models import RawVerse


class RandVerse:

    def select_word(self, text: str) -> str:
        words = re.findall(r"[^\W\d_]+", text, flags=re.UNICODE)
        word = random.choices(words)[0]
        word = word.lower()
        return word

    def rand_verse(self) -> dict[int, str]:
        verses = RawVerse.objects.all()
        order_word: dict[str, str] = {}
        for verse in verses:
            order_word[verse.order] = self.select_word(verse.text)
        return order_word

    def only_words(self) -> str:
        html_words = self.rand_verse()
        new_verse = " ".join(list(html_words.values()))
        return new_verse
