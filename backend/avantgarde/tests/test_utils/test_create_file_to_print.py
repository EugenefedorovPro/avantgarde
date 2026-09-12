import tempfile
from pathlib import Path

from django.test import TestCase

from avantgarde.models import ContentOrder, HermToQrCode
from avantgarde.utils.create_file_to_print import CreateFileToPrint


class TestCreateFileToPrint(TestCase):
    def setUp(self):
        HermToQrCode.objects.create(title="QR", text="Journal text")
        ContentOrder.objects.create(
            content="verse",
            order=10,
            html_name="test-verse",
            html_for_qr="https://example.com/verse/test-verse/",
            qr_text="Test verse",
        )

    def test_one_file(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_path = Path(tmp_dir) / "qr_print.docx"
            docx_path, pdf_path = CreateFileToPrint().create_file_to_print(
                out_path=str(output_path), also_pdf=False
            )

            self.assertEqual(Path(docx_path), output_path)
            self.assertIsNone(pdf_path)
            self.assertTrue(output_path.is_file())
            self.assertGreater(output_path.stat().st_size, 0)
