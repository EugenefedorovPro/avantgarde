from django.test import TestCase
from avantgarde.models import RawVerse
from django.contrib.auth.models import User
import datetime


class CreateTestVerses(TestCase):

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


