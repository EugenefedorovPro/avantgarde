import ipdb
import json
from avantgarde.utils.rand_verse import RandVerse
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.models import RawVerse
from django.urls import reverse


class TestRandVerse(CreateTestVerses):

    def test_rand_verse_utils(self):
        rand_verse: dict[int, str] = RandVerse().rand_verse()
        expected = {
            0: "text",
            1: "text",
            2: "text",
            3: "text",
            4: "text",
            5: "text",
            6: "text",
            7: "text",
            8: "text",
            9: "text",
        }

        self.assertEqual(expected, rand_verse)

    def test_rand_verse_view(self):
        url = reverse("rand_verse")
        response = self.client.get(url)
        print(response.data)
        self.assertEqual(response.status_code, 200)
