import ipdb
from avantgarde.models import Reclamation, AnswerToReclamation
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.views import ReclamationView


class TestReclamationView(CreateTestVerses):
    def populate_recl(self):
        recl_1 = Reclamation.objects.create(
            text="reclamation_1",
            html_name="html_name_reclamation_1",
        )
        recl_2 = Reclamation.objects.create(
            text="reclamation_2",
            html_name="html_name_reclamation_2",
        )
        answer_1 = AnswerToReclamation.objects.create(
            text="answer_1 to reclamation_1",
            reclamation=recl_1,
            repeat=10,
        )

    def test_reclamation_view(self):
        self.populate_recl()

        url = f"/reclamation/"
        response = self.client.get(url)
        actual = response.data
        expected = {
            "answer": {"pk": 1, "text": "answer_1 to reclamation_1", "repeat": 10},
            "reclamation": {
                "pk": 1,
                "text": "reclamation_1",
                "html_name": "html_name_reclamation_1",
            },
        }
        print(actual)
        self.assertEqual(expected, actual)
