import ipdb
from unittest import skip
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.models import HermToMakeCopy


class TestPdfTextView(CreateTestVerses):

    def test_success(self):
        title = "test_title"
        text = "test_text"
        HermToMakeCopy.objects.create(title=title, text=text)

        url = "/print/text/"
        response = self.client.get(url)
        actual_title = response.data["herm"]["title"]
        actual_text = response.data["herm"]["text"]
        self.assertEqual(text, actual_text)
        self.assertEqual(title, actual_title)
