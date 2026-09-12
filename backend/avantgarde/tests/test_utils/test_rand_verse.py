from django.urls import reverse

from avantgarde.models import HermRandVerse
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.utils.rand_verse import RandVerse


class TestRandVerse(CreateTestVerses):
    def test_rand_verse_utils(self):
        rand_verse = RandVerse().rand_verse()
        expected = {
            "0": "text text text text",
            "1": "text text text text",
            "2": "text text",
        }

        self.assertEqual(expected, rand_verse)

    def test_rand_verse_view(self):
        HermRandVerse.objects.create(
            text="Universe: {univ_placeholder}",
            html_name="random-verse-shadow",
        )

        response = self.client.get(reverse("rand_verse"))

        self.assertEqual(response.status_code, 200)
