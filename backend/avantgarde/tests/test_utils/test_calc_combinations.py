import ipdb
import json
from avantgarde.utils.calc_combinations import CalcCombinations
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.models import RawVerse
from django.urls import reverse


NUMBER_WORDS_IN_TEXT = 3

class TestRandVerse(CreateTestVerses):

    def make_longer_texts(self):
        verses = RawVerse.objects.all()
        for verse in verses:
            verse.text = verse.text + f" {' a' * (NUMBER_WORDS_IN_TEXT - 1)}"
            verse.save()


    def test_calc_combinations(self):
        self.make_longer_texts()
        actual_combinations = CalcCombinations().calc_combinations()
        expected = NUMBER_WORDS_IN_TEXT ** RawVerse.objects.count()
        print(f"number_of_combinations = {actual_combinations}")
        self.assertEqual(actual_combinations, expected)


