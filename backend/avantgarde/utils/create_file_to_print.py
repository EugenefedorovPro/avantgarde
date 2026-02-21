import os
import subprocess
from io import BytesIO
from pathlib import Path
from typing import Optional, Tuple

from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm

from avantgarde.models import ContentOrder, HermToQrCode
from avantgarde.utils.draw_qr import DrawQR

BASE_URL: str = os.getenv("VITE_BASE_URL", "").rstrip("/")
TEMPLATE_PATH: Path = Path(__file__).resolve().parent / "template.docx"


def docx_to_pdf(docx_path: str, out_dir: Optional[str] = None) -> str:
    """
    Convert DOCX -> PDF using LibreOffice (soffice) in headless mode.
    Returns the resulting PDF file path.
    """
    docx = Path(docx_path).resolve()
    if not docx.exists():
        raise FileNotFoundError(f"DOCX not found: {docx}")

    output_dir = Path(out_dir).resolve() if out_dir else docx.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "soffice",
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--norestore",
        "--convert-to",
        "pdf",
        "--outdir",
        str(output_dir),
        str(docx),
    ]

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(
            "LibreOffice conversion failed.\n"
            f"cmd: {' '.join(cmd)}\n"
            f"stdout:\n{r.stdout}\n"
            f"stderr:\n{r.stderr}\n"
        )

    pdf_path = output_dir / f"{docx.stem}.pdf"
    if not pdf_path.exists():
        raise RuntimeError(
            f"LibreOffice reported success, but PDF not found: {pdf_path}"
        )

    return str(pdf_path)


class CreateFileToPrint:
    def create_file_to_print(
        self,
        out_path: str = "qr_print.docx",
        also_pdf: bool = True,
    ) -> Tuple[str, Optional[str]]:
        """
        Create a DOCX using a docxtpl template.
        If also_pdf=True, convert it to PDF via LibreOffice.

        Template variables expected:
          - {{ text }}   (from HermToQrCode singleton)
          - rows loop with {{ row.img1 }} (or whatever you use in template)
        """
        if not TEMPLATE_PATH.exists():
            raise FileNotFoundError(f"Template DOCX not found: {TEMPLATE_PATH}")

        tpl = DocxTemplate(str(TEMPLATE_PATH))

        # Load singleton text (pk=1 ensured by .load()).
        herm = HermToQrCode.load()
        herm_text = herm.text or ""

        dq = DrawQR(scale=24, border=4)

        # NOTE: Your queryset returns (html_for_qr, qr_text) but you named the
        # first variable html_name earlier. Keep naming consistent:
        items = list(
            ContentOrder.objects.order_by("order").values_list("html_for_qr", "qr_text")
        )

        images: list[InlineImage] = []
        for html_for_qr, qr_text in items:
            # html_for_qr can be a full URL or a path; normalize safely.
            if isinstance(html_for_qr, str) and html_for_qr.startswith(
                ("http://", "https://")
            ):
                url = html_for_qr.rstrip("/")
            else:
                path = (html_for_qr or "").strip("/")
                if BASE_URL:
                    url = f"{BASE_URL}/{path}"
                else:
                    url = f"/{path}" if path else "/"

            png_bytes = dq.draw_qr(url=url, text=qr_text)

            images.append(
                InlineImage(
                    tpl,
                    BytesIO(png_bytes),
                    width=Mm(110),
                )
            )

        context = {
            "text": herm_text,  # matches {{ text }} in template.docx
            "rows": [{"img1": img} for img in images],
        }

        tpl.render(context)
        tpl.save(out_path)

        pdf_path: Optional[str] = None
        if also_pdf:
            pdf_path = docx_to_pdf(out_path)

        return out_path, pdf_path
