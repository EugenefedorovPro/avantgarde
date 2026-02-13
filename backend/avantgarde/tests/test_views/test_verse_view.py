import ipdb
from django.test import TestCase
from avantgarde.views import VerseView, get_new_order_verse
from avantgarde.models import RawVerse
from django.contrib.auth.models import User
from avantgarde.tests.create_test_verses import CreateTestVerses
import datetime
from unittest import skip


class TestVerseView(CreateTestVerses):

    def test_verse_view(self):
        url = f"/verse/1/"
        response = self.client.get(url)
        actual = response.data

        expected = {
            "verse": {
                "pk": 2,
                "order": 1,
                "html_name": "html_name_1",
                "title": "title_1",
                "text": "text_1",
                "date_of_writing": "2026-01-26",
            },
            "herm": {
                "pk": 2,
                "html_name": "herm_html_name_1",
                "title": "herm_html_name_1",
                "text": "herm_text_{i}",
                "date_of_writing": "2026-01-26",
            },
            "audio": {
                "pk": 2,
                "audio": "/media/pokrovsk.mp3",
                "html_name": "audio_html_name_1",
            },
        }

        self.assertEqual(response.status_code, 200)
        print(f"response.data = {response.data}")
        self.assertEqual(expected, actual)

