import ipdb
from avantgarde.utils.create_neologism import CreateNeologism, Pattern, Harmony
from avantgarde.tests.create_test_verses import CreateTestVerses
from django.urls import reverse


class TestCreateNeologizm(CreateTestVerses):

    def test_generate_letter(self):
        CreateN = CreateNeologism()
        new_letters: list[str] = []
        for i in range(10):
            new_letters.append(CreateN.generate_letter(Pattern.ANY_L))
        print(f"new_random_letters = {new_letters}")
        self.assertTrue(len(set(new_letters)) > 1)

    def test_generate_word(self):
        pattern = [
            Pattern.ANY_V,
            Pattern.ANY_C,
            Pattern.STRESS,
            Pattern.ANY_V,
            Pattern.ANY_C,
        ]
        CreateN = CreateNeologism()
        new_word = CreateN.generate_word(pattern)
        print(f"new_random_word = {new_word}")
        self.assertEqual(len(new_word), 5)

    def test_create_newologizm(self):
        number_words = 30
        CreateN = CreateNeologism()

        spontaneity = CreateN.create_neologizm(Harmony.SPONTANEITY, number_words)
        harmony = CreateN.create_neologizm(Harmony.HARMONY, number_words)
        disharmony = CreateN.create_neologizm(Harmony.DISHARMONY, number_words)

        print(f"spantaneous_words = {spontaneity}")
        print(f"harmonious_words = {harmony}")
        print(f"disharmonious_words = {disharmony}")

        self.assertTrue(len(spontaneity) + len(harmony) + len(disharmony), number_words * 3)
