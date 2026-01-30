import ipdb
from django.test import TestCase
from avantgarde.views import VerseView, get_new_order
from avantgarde.models import RawVerse
from django.contrib.auth.models import User
from avantgarde.tests.create_test_verses import CreateTestVerses
import datetime


class TestVerseView(CreateTestVerses):

    def test_verse_view(self):
        url = f"/verse/html_name_1/current/"
        response = self.client.get(url)
        actual = response.data
        # del actual["pk"]

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

    def test_new_order_no_order(self):
        RawVerse.objects.all().delete()
        next_order = get_new_order(cur=1, next_to_return=True)
        self.assertFalse(next_order)

    def test_new_order_next(self):
        last_number: int = max(RawVerse.objects.values_list("order", flat=True))
        next_order = get_new_order(cur=last_number, next_to_return=True)
        self.assertEqual(next_order, 0)

        next_order = get_new_order(cur=3, next_to_return=True)
        self.assertEqual(next_order, 4)

    def test_new_order_prev(self):
        orders = RawVerse.objects.values_list("order", flat=True)
        last_number: int = max(orders)
        first_number: int = min(orders)
        prev_order = get_new_order(cur=first_number, next_to_return=False)
        self.assertEqual(prev_order, last_number)

        next_order = get_new_order(cur=3, next_to_return=False)
        self.assertEqual(next_order, 2)
