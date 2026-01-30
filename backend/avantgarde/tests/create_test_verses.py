import ipdb
from django.test import TestCase
from avantgarde.models import RawVerse, Audio, Hermeneutics
from django.contrib.auth.models import User
import datetime


class CreateTestVerses(TestCase):

    def setUp(self):
        # create test user
        self.test_user = "test_user"
        self.test_pass = "test_pass"
        User.objects.create_user(username=self.test_user, password=self.test_pass)
        self.client.login(username=self.test_user, password=self.test_pass)

        # create verses
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

        # create audio and herms
        audio_objs = []
        herm_objs = []
        for i, verse in enumerate(verses):
            audio_objs.append(
                Audio(
                    raw_verses = verse,
                    html_name = f"audio_html_name_{i}",
                    title = f"audio_html_name_{i}",
                    date_of_writing=datetime.date(2026, 1, 26),
                    audio=f"pokrovsk.mp3",
                ))
            herm_objs.append(
                Hermeneutics(
                    raw_verses = verse,
                    text="herm_text_{i}",
                    html_name = f"herm_html_name_{i}",
                    title = f"herm_html_name_{i}",
                    date_of_writing=datetime.date(2026, 1, 26),
                )
            )
        Audio.objects.bulk_create(audio_objs)
        Hermeneutics.objects.bulk_create(herm_objs)



