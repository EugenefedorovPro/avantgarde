from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.utils.create_neologism import (
    ALL_LETTERS,
    CreateNeologism,
    Harmony,
    Pattern,
)


class TestCreateNeologizm(CreateTestVerses):
    def test_generate_letter(self):
        creator = CreateNeologism()
        new_letters = [creator.generate_letter(Pattern.ANY_L) for _ in range(10)]

        self.assertTrue(all(letter in ALL_LETTERS for letter in new_letters))

    def test_generate_word(self):
        pattern = [
            Pattern.ANY_V,
            Pattern.ANY_C,
            Pattern.STRESS,
            Pattern.ANY_V,
            Pattern.ANY_C,
        ]

        new_word = CreateNeologism().generate_word(pattern)

        self.assertEqual(len(new_word), 5)

    def test_create_neologizm(self):
        number_words = 30
        creator = CreateNeologism()

        spontaneity = creator.create_neologizm(Harmony.SPONTANEITY, number_words)
        harmony = creator.create_neologizm(Harmony.HARMONY, number_words)
        disharmony = creator.create_neologizm(Harmony.DISHARMONY, number_words)

        self.assertEqual(
            len(spontaneity) + len(harmony) + len(disharmony),
            number_words * 3,
        )
