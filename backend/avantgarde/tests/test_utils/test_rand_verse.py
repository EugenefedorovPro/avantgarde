import ipdb
from avantgarde.utils.rand_verse import RandVerse
from avantgarde.tests.create_test_verses import CreateTestVerses


class TestCompileRandVerse(CreateTestVerses):

    def test_rand_verse(self):
        rand_verse: dict[str, str] = RandVerse().rand_verse()
        expected = {
            "html_name_0": "text",
            "html_name_1": "text",
            "html_name_2": "text",
            "html_name_3": "text",
            "html_name_4": "text",
            "html_name_5": "text",
            "html_name_6": "text",
            "html_name_7": "text",
            "html_name_8": "text",
            "html_name_9": "text",
        }

        self.assertEqual(expected, rand_verse)
