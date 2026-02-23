import re
import random
from typing import Iterable

from avantgarde.models import RawVerse

WORDS_PER_LINE = 4  # how many words in each rendered line


class CalcCombinations:
    def calc_combinations(self) -> None:
        # placeholder: implement if you really need combinatorics
        _texts = RawVerse.objects.values_list("text", flat=True)
        return None


class RandVerse:
    _word_re = re.compile(r"[^\W\d_]+", flags=re.UNICODE)

    def clean_text(self, text: str) -> list[str]:
        # keep only letter-words, no digits, no underscores
        return self._word_re.findall(text)

    def select_word(self, text: str) -> str:
        words = self.clean_text(text)
        if not words:
            return ""
        return random.choice(words).lower()

    def _iter_words(self, verses: Iterable[RawVerse]) -> list[str]:
        # stable ordering matters in production
        words: list[str] = []
        for verse in verses:
            w = self.select_word(verse.text)
            if w:
                words.append(w)
        return words

    def _format_words_md(self, words: list[str], words_per_line: int = WORDS_PER_LINE) -> str:
        if words_per_line <= 0:
            raise ValueError("words_per_line must be > 0")

        lines: list[str] = []
        for i in range(0, len(words), words_per_line):
            chunk = words[i : i + words_per_line]
            lines.append(" ".join(chunk))

        # Markdown hard line breaks
        return "  \n".join(lines)

    def rand_verse(self, words_per_line: int = WORDS_PER_LINE) -> dict[str, str]:
        verses = RawVerse.objects.order_by("order").only("order", "text")
        words = self._iter_words(verses)

        formatted = self._format_words_md(words, words_per_line=words_per_line)

        # keep your current API shape: dict of "order" -> "word"
        # but now each "line" is stored under synthetic keys so frontend can join safely
        # If you do not need dict, return {"text": formatted} instead.
        return {str(i): line for i, line in enumerate(formatted.split("  \n"))}

    def only_words(self, words_per_line: int = WORDS_PER_LINE) -> str:
        data = self.rand_verse(words_per_line=words_per_line)
        # rebuild with consistent line breaks
        return "  \n".join(data.values())
