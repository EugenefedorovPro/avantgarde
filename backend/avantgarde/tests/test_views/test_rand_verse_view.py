import ipdb
from avantgarde.models import HermRandVerse
from avantgarde.tests.create_test_verses import CreateTestVerses


class TestRandVerseView(CreateTestVerses):

    def test_rand_verse_view(self):
        HermRandVerse.objects.create(
            text="some HermRandVerse text with universe = {univ_placeholder}",
            html_name="some HermRandVerse htmml_name",
        )

        url = f"/rand_verse/"
        response = self.client.get(url)
        actual = response.data
        expected = {
            "rand_verse": {
                0: "text  \n",
                1: "text",
                2: "text",
                3: "text",
                4: "text  \n",
                5: "text",
                6: "text",
                7: "text",
                8: "text  \n",
                9: "text",
            },
            "herm": "some HermRandVerse text with universe = 0",
        }
        print(response.data)
        self.assertEqual(response.data, expected)
