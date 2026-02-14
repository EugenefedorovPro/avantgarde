import ipdb
from avantgarde.utils.create_neologism import CreateNeologism, Pattern
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
        pattern = [Pattern.ANY_V, Pattern.ANY_C, Pattern.STRESS, Pattern.ANY_V, Pattern.ANY_C]
        CreateN = CreateNeologism()
        new_word = CreateN.generate_word(pattern)
        print(f"new_random_word = {new_word}")
        self.assertEqual(len(new_word), 4)

    # def test_put_stress_on_word(self):
    #     word = "лилея"
    #     to_stress = 2
    #     CreateN = CreateNeologism()
    #     stressed_word = CreateN.put_stress_on_word(
    #         word=word, number_vowel_to_stress=to_stress
    #     )
    #     expected = "лиле'я"
    #     print(f"stressed_word = {stressed_word}")
    #     self.assertEqual(expected, stressed_word)
