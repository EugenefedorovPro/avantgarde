import ipdb
from django.test import TestCase
from avantgarde.views import VerseView, get_new_order
from avantgarde.models import RawVerse
from django.contrib.auth.models import User
import datetime


class TestVerseView(TestCase):

    def setUp(self):
        self.test_user = "test_user"
        self.test_pass = "test_pass"
        User.objects.create_user(username=self.test_user, password=self.test_pass)
        self.client.login(username=self.test_user, password=self.test_pass)

        verses = []
        for i in range(10):
            verses.append(
                RawVerse(
                    html_name=f"html_name_{i}",
                    order=f"{i}",
                    title=f"title_{i}",
                    text=f"text_{i}",
                    date_of_writing=datetime.date(2026, 1, 26),
                )
            )
        RawVerse.objects.bulk_create(verses)

        self.verse = RawVerse.objects.get(pk=1)

    def test_verse_view(self):
        url = f"/verse/html_name_1/current/"
        response = self.client.get(url)
        actual = response.data
        del actual["pk"]

        expected = {
            "html_name": "html_name_1",
            "order": 1,
            "title": "title_1",
            "text": "text_1",
            "date_of_writing": "2026-01-26",
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
