import ipdb
from pprint import pprint
from avantgarde.models import HistoryTime, HermToHistory
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
        url = "/neologizm/"
        response = self.client.get(url)
        pprint(f"neologizm_view_response = {response.data}")
        pprint(list(response.data.keys()))
        pprint(list(response.data.get("years")))
        expected = [
            "harmony_words",
            "disharmony_words",
            "spontaneity_words",
            "years",
            "herm",
        ]
        self.assertEqual(expected, list(response.data.keys()))
