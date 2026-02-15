from abc import ABC, abstractmethod
import random
import ipdb
from enum import Enum

# -------------------------
# Spontaneous (general pool)
# -------------------------

ALL_VOWELS: list[str] = (
    ["а"] * 8
    + ["о"] * 6
    + ["е"] * 6
    + ["и"] * 3
    + ["у"] * 1
    + ["я"] * 1
    + ["ю"] * 1
    + ["ы"] * 1
    + ["э"] * 1
    + ["ё"] * 1  # keep single (salient)
)

ALL_CONSONANTS: list[str] = (
    ["н"] * 4
    + ["р"] * 3
    + ["л"] * 3
    + ["м"] * 2
    + ["в"] * 2
    + ["с"] * 2
    + ["т"] * 2
    + ["к"] * 2
    + ["п"] * 2
    + ["д"] * 2
    # keep the rest single so they still appear
    + ["б", "г", "ж", "з", "й", "ф", "х", "ц", "ч", "ш", "щ"]
)

SOFT_HARD: list[str] = ["ь"] * 5 + ["ъ"] * 1

ALL_LETTERS: list[str] = ALL_VOWELS + ALL_CONSONANTS


# -------------------------
# Harmonious (euphonic pool)
# -------------------------

HARMONIOUS_VOWELS: list[str] = (
    ["а"] * 6
    + ["о"] * 6
    + ["е"] * 3
    + ["и"] * 3
    + ["я"] * 1
    + ["ю"] * 1
    + ["ё"] * 1  # keep single
)

SONORANT_CONSONANTS: list[str] = (
    ["л"] * 6 + ["н"] * 6 + ["р"] * 6 + ["м"] * 3 + ["й"] * 1
)

SOFT_FRICATIVES: list[str] = ["в"] * 4 + ["з"] * 2 + ["ж"] * 1

HARMONIOUS_CONSONANTS: list[str] = SONORANT_CONSONANTS + SOFT_FRICATIVES
ALL_HARM_LETTERS: list[str] = HARMONIOUS_VOWELS + HARMONIOUS_CONSONANTS


# -------------------------
# Disharmonious (cacophonic pool)
# -------------------------

DISHARMONIOUS_VOWELS: list[str] = ["ы"] * 1 + ["э"] * 2 + ["у"] * 3

SIBILANTS: list[str] = ["ш"] * 1 + ["щ"] * 1 + ["ц"] * 1 + ["ч"] * 2 + ["с"] * 2

PLOSIVES: list[str] = (
    ["к"] * 3 + ["т"] * 3 + ["п"] * 2 + ["б"] * 2 + ["д"] * 2 + ["г"] * 2
)

HARSH_FRICATIVES: list[str] = ["х"] * 3 + ["ф"] * 2

# keep "ж" out (as you decided it's harmonious)
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
    STRESS = "\u0301"
    S_H = "soft_hard"


class Harmony(Enum):
    SPONTANEITY = "spontaneity"
    HARMONY = "harmonious"
    DISHARMONY = "disharmonious"


class RegularPatterns(ABC):
    @abstractmethod
    def pick_up(self) -> list[Pattern]:
        pass


class SpontaneousPattern(RegularPatterns):
    """
    Spontaneous = mostly ANY_L, sometimes inserts ь/ъ (S_H), and always places
    stress correctly by putting STRESS immediately after ANY_V.
    """

    # 7 tokens (includes S_H + stressed vowel)
    pattern_1: list[Pattern] = [
        Pattern.ANY_L,
        Pattern.ANY_C,
        Pattern.S_H,
        Pattern.ANY_L,
        Pattern.ANY_V,
        Pattern.STRESS,
        Pattern.ANY_L,
    ]

    # 6 tokens (simple)
    pattern_2: list[Pattern] = [
        Pattern.ANY_L,
        Pattern.ANY_V,
        Pattern.STRESS,
        Pattern.ANY_L,
        Pattern.ANY_L,
        Pattern.ANY_L,
    ]

    # 6 tokens (simple, stress later)
    pattern_3: list[Pattern] = [
        Pattern.ANY_L,
        Pattern.ANY_L,
        Pattern.ANY_L,
        Pattern.ANY_V,
        Pattern.STRESS,
        Pattern.ANY_L,
    ]

    # NEW: 5 tokens (short), includes S_H but keeps stress on vowel
    pattern_4: list[Pattern] = [
        Pattern.ANY_L,
        Pattern.ANY_V,
        Pattern.STRESS,
        Pattern.ANY_L,
    ]

    def pick_up(self):
        return random.choice(
            [self.pattern_1, self.pattern_2, self.pattern_3, self.pattern_4]
        )


class HarmoniousPattern(RegularPatterns):
    """
    Harmonious = only HARM_C / HARM_V, and stress is always correct because
    STRESS comes immediately after HARM_V.
    """

    pattern_1: list[Pattern] = [
        Pattern.HARM_C,
        Pattern.HARM_V,
        Pattern.HARM_C,
        Pattern.HARM_V,
        Pattern.STRESS,
        Pattern.HARM_C,
        Pattern.HARM_V,
    ]
    pattern_2: list[Pattern] = [
        Pattern.HARM_V,
        Pattern.HARM_C,
        Pattern.HARM_V,
        Pattern.STRESS,
        Pattern.HARM_C,
        Pattern.HARM_C,
        Pattern.HARM_V,
    ]
    pattern_3: list[Pattern] = [
        Pattern.HARM_C,
        Pattern.HARM_V,
        Pattern.HARM_V,
        Pattern.STRESS,
        Pattern.HARM_C,
        Pattern.HARM_V,
    ]

    # NEW: shorter (5 tokens), still “smooth” and stress lands on the vowel
    pattern_4: list[Pattern] = [
        Pattern.HARM_C,
        Pattern.HARM_V,
        Pattern.STRESS,
        Pattern.HARM_C,
        Pattern.HARM_V,
    ]

    def pick_up(self):
        return random.choice(
            [self.pattern_1, self.pattern_2, self.pattern_3, self.pattern_4]
        )


class DisharmoniousPattern(RegularPatterns):
    """
    Disharmonious = only DIS_C / DIS_V (plus optional ь/ъ via S_H),
    and stress is correct because STRESS always comes immediately after DIS_V.
    """

    pattern_1: list[Pattern] = [
        Pattern.DIS_C,
        Pattern.DIS_V,
        Pattern.DIS_C,
        Pattern.S_H,
        Pattern.DIS_V,
        Pattern.STRESS,
        Pattern.DIS_C,
        Pattern.DIS_V,
    ]
    pattern_2: list[Pattern] = [
        Pattern.DIS_C,
        Pattern.DIS_V,
        Pattern.STRESS,
        Pattern.DIS_C,
        Pattern.DIS_C,
        Pattern.DIS_V,
    ]
    pattern_3: list[Pattern] = [
        Pattern.DIS_V,
        Pattern.DIS_C,
        Pattern.DIS_C,
        Pattern.DIS_V,
        Pattern.STRESS,
        Pattern.DIS_C,
    ]

    # NEW: shorter (5 tokens), keeps the “harsh” palette and correct vowel stress
    pattern_4: list[Pattern] = [
        Pattern.DIS_C,
        Pattern.DIS_V,
        Pattern.STRESS,
        Pattern.DIS_C,
        Pattern.DIS_V,
    ]

    def pick_up(self):
        return random.choice(
            [self.pattern_1, self.pattern_2, self.pattern_3, self.pattern_4]
        )


class CreateNeologism:

    def __init__(self):
        self.regular_patterns: dict[Harmony, RegularPatterns] = {
            Harmony.SPONTANEITY: SpontaneousPattern(),
            Harmony.HARMONY: HarmoniousPattern(),
            Harmony.DISHARMONY: DisharmoniousPattern(),
        }

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
            Pattern.S_H: random.choice(SOFT_HARD),
        }
        return rand_letters[letter]

    def generate_word(self, pattern: list[Pattern]):
        new_letters: list[str] = []
        for letter in pattern:
            new_letters.append(self.generate_letter(letter))
        new_word: str = "".join(new_letters)
        return new_word

    def create_neologizm(self, pattern_by_harmony: Harmony, n_words: int = 1) -> list[str]:
        PatternClass: RegularPatterns = self.regular_patterns[pattern_by_harmony]
        pattern: list[Pattern] = PatternClass.pick_up()
        new_words: list[str] = []
        for i in range(n_words):
            new_words.append(self.generate_word(pattern))
        return new_words
