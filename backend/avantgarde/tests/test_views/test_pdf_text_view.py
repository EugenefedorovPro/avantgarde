from pathlib import Path
from unittest.mock import patch

from django.core.cache import cache
from django.urls import reverse

from avantgarde.models import HermToMakeCopy
from avantgarde.tests.create_test_verses import CreateTestVerses


class TestPrintViews(CreateTestVerses):
    def setUp(self):
        super().setUp()
        cache.clear()

    def test_success(self):
        title = "test_title"
        text = "test_text"
        HermToMakeCopy.objects.create(title=title, text=text)

        response = self.client.get(reverse("print_text"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(text, response.data["herm"]["text"])
        self.assertEqual(title, response.data["herm"]["title"])

    def test_missing_text_returns_not_found(self):
        response = self.client.get(reverse("print_text"))
        self.assertEqual(response.status_code, 404)

    @patch("avantgarde.views.CreateFileToPrint.create_file_to_print")
    def test_pdf_is_available_after_temporary_files_are_removed(self, create_file):
        pdf_content = b"%PDF-1.4\ntest PDF\n%%EOF"

        def create_pdf(out_path: str, also_pdf: bool):
            pdf_path = Path(out_path).with_suffix(".pdf")
            pdf_path.write_bytes(pdf_content)
            return out_path, str(pdf_path)

        create_file.side_effect = create_pdf

        response = self.client.get(reverse("print_pdf_file"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(b"".join(response.streaming_content), pdf_content)
        self.assertEqual(response["Content-Length"], str(len(pdf_content)))
        self.assertEqual(response["Cache-Control"], "public, max-age=300")

        cached_response = self.client.get(reverse("print_pdf_file"))
        self.assertEqual(b"".join(cached_response.streaming_content), pdf_content)
        create_file.assert_called_once()

    @patch("avantgarde.views.CreateFileToPrint.create_file_to_print")
    def test_pdf_generation_error_does_not_expose_internal_details(self, create_file):
        create_file.side_effect = RuntimeError("sensitive internal path")

        with self.assertLogs("avantgarde.views", level="ERROR"):
            response = self.client.get(reverse("print_pdf_file"))

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.data, {"detail": "PDF generation failed"})
