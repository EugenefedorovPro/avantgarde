from avantgarde.models import RawVerse
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.utils.calc_combinations import CalcCombinations

NUMBER_WORDS_IN_TEXT = 60


class TestCalcCombinations(CreateTestVerses):
    def make_longer_texts(self):
        verses = RawVerse.objects.all()
        for verse in verses:
            verse.text = verse.text + f" {' a' * (NUMBER_WORDS_IN_TEXT - 1)}"
            verse.save()

    def test_calc_combinations(self):
        self.make_longer_texts()

        actual_combinations = CalcCombinations().calc_combinations()
        expected = NUMBER_WORDS_IN_TEXT ** RawVerse.objects.count()

        self.assertEqual(actual_combinations, expected)

    def test_calc_times_longer_than_universe(self):
        self.make_longer_texts()

        actual = CalcCombinations().calc_times_longer_than_universe()

        self.assertEqual(actual, "1")
