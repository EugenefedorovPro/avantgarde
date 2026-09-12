from django.urls import reverse

from avantgarde.models import HermRandVerse
from avantgarde.tests.create_test_verses import CreateTestVerses


class TestRandVerseView(CreateTestVerses):
    def test_rand_verse_view(self):
        HermRandVerse.objects.create(
            text="some HermRandVerse text with universe = {univ_placeholder}",
            html_name="random-verse-shadow",
        )

        response = self.client.get(reverse("rand_verse"))

        expected = {
            "rand_verse": {
                "0": "text text text text",
                "1": "text text text text",
                "2": "text text",
            },
            "herm": "some HermRandVerse text with universe = 0",
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)
