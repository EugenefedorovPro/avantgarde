from django.urls import reverse

from avantgarde.models import HermToHistory, HistoryTime
from avantgarde.tests.create_test_verses import CreateTestVerses


class TestNeologizmView(CreateTestVerses):
    def populate_history_time(self):
        for i in range(3):
            HistoryTime.objects.create(
                order=i,
                year=f"200{i}",
                word_of_year=f"test_word_of_year_{i}",
            )

        HermToHistory.objects.create(title="herm_title", text="herm_text")

    def test_neologizm_view(self):
        self.populate_history_time()
        response = self.client.get(reverse("neologizm"))

        expected_keys = [
            "harmony_words",
            "disharmony_words",
            "spontaneity_words",
            "years",
            "herm",
        ]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(expected_keys, list(response.data.keys()))
        self.assertEqual(
            ["2000", "2001", "2002"],
            [item["year"] for item in response.data["years"]],
        )

    def test_missing_shadow_is_returned_as_null(self):
        HistoryTime.objects.create(order=1, year="2000", word_of_year="word")

        response = self.client.get(reverse("neologizm"))

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["herm"])
