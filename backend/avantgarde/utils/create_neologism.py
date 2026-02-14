import random
import ipdb
from enum import Enum

ALL_VOWELS: list[str] = ["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"]

ALL_CONSONANTS: list[str] = [
    "б",
    "в",
    "г",
    "д",
    "ж",
    "з",
    "й",
    "к",
    "л",
    "м",
    "н",
    "п",
    "р",
    "с",
    "т",
    "ф",
    "х",
    "ц",
    "ч",
    "ш",
    "щ",
]

ALL_LETTERS: list[str] = ALL_VOWELS + ALL_CONSONANTS


# ---------- harmonious (euphonic) ----------
HARMONIOUS_VOWELS: list[str] = ["а", "о", "е", "ё", "и", "я", "ю"]

SONORANT_CONSONANTS: list[str] = ["л", "м", "н", "р", "й"]
SOFT_FRICATIVES: list[str] = ["в", "з", "ж"]

HARMONIOUS_CONSONANTS: list[str] = SONORANT_CONSONANTS + SOFT_FRICATIVES

ALL_HARM_LETTERS: list[str] = HARMONIOUS_VOWELS + HARMONIOUS_CONSONANTS


# ---------- disharmonious (cacophonic) ----------
DISHARMONIOUS_VOWELS: list[str] = ["ы", "э", "у"]

SIBILANTS: list[str] = ["ш", "щ", "ч", "ц", "с"]  # noisy
PLOSIVES: list[str] = ["п", "б", "т", "д", "к", "г"]  # plosives
HARSH_FRICATIVES: list[str] = ["ф", "х"]  # harsh fricatives

# NOTE: "ж" is already in HARMONIOUS (as a softer fricative),
# so we intentionally do NOT include it here to keep sets disjoint.
DISHARMONIOUS_CONSONANTS: list[str] = SIBILANTS + PLOSIVES + HARSH_FRICATIVES

ALL_DISHARM_LETTERS: list[str] = DISHARMONIOUS_VOWELS + DISHARMONIOUS_CONSONANTS


class Pattern(Enum):
    ANY_C = "any_c"
    ANY_V = "any_v"
    HARM_C = "harm_c"
    HARM_V = "harm_v"
    DIS_V = "dis_v"
    DIS_C = "dis_c"
    ANY_L = "any_letter"
    STRESS = "'"




class CreateNeologism:
    def generate_letter(self, letter: Pattern) -> str:
        rand_letters: dict[Pattern, str] = {
            Pattern.ANY_C: random.choice(ALL_CONSONANTS),
            Pattern.ANY_V: random.choice(ALL_VOWELS),
            Pattern.HARM_C: random.choice(HARMONIOUS_CONSONANTS),
            Pattern.HARM_V: random.choice(HARMONIOUS_VOWELS),
            Pattern.DIS_C: random.choice(DISHARMONIOUS_CONSONANTS),
            Pattern.DIS_V: random.choice(DISHARMONIOUS_VOWELS),
            Pattern.ANY_L: random.choice(ALL_LETTERS),
            Pattern.STRESS: Pattern.STRESS.value,

        }
        return rand_letters[letter]

    def generate_word(self, pattern: list[Pattern]):
        new_letters: list[str] = []
        for letter in pattern:
            new_letters.append(self.generate_letter(letter))
        new_word: str = "".join(new_letters)
        return new_word

    def choose_harmony_degree(self):
        spontaneouse: list[Pattern] = [Pattern.HARM_C. Pattern.HARM_V, Pattern.HARM_C, Pattern.HARM_V, Pattern.HARM_C]
        harmonious: list[pattern] = [Pattern.HARM_C. Pattern.HARM_V, Pattern.HARM_C, Pattern.HARM_V, Pattern.HARM_C]

    def put_stress_on_word(self, word: str, number_vowel_to_stress: int):
        count_vowels = 0
        stressed_word: list[str] | str = []
        for letter in word:
            if letter in ALL_VOWELS:
                count_vowels += 1
                if count_vowels == number_vowel_to_stress:
                    letter = letter + "'"
            stressed_word.append(letter)
        stressed_word = "".join(stressed_word)
        return stressed_word


    def create_neologizm(self, word_length: int):
        pass
