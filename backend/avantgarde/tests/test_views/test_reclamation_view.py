from django.urls import reverse

from avantgarde.models import AnswerToReclamation, Reclamation
from avantgarde.tests.create_test_verses import CreateTestVerses


class TestReclamationView(CreateTestVerses):
    def populate_reclamations(self):
        reclamation = Reclamation.objects.create(
            text="reclamation_1",
            html_name="html_name_reclamation_1",
        )
        Reclamation.objects.create(
            text="reclamation_2",
            html_name="html_name_reclamation_2",
        )
        AnswerToReclamation.objects.create(
            text="answer_1 to reclamation_1",
            reclamation=reclamation,
            repeat=10,
        )

    def expected_response(self):
        return {
            "answer": {"pk": 1, "text": "answer_1 to reclamation_1", "repeat": 10},
            "reclamation": {
                "pk": 1,
                "text": "reclamation_1",
                "html_name": "html_name_reclamation_1",
            },
        }

    def test_reclamation_view(self):
        self.populate_reclamations()

        response = self.client.get(reverse("reclamation"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.expected_response(), response.data)

    def test_reclamation_by_name_view(self):
        self.populate_reclamations()
        url = reverse(
            "reclamation_by_name",
            kwargs={"html_name": "html_name_reclamation_1"},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.expected_response(), response.data)
