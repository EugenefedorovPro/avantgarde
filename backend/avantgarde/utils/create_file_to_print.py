from io import BytesIO
from docxtpl import DocxTemplate, InlineImage
from docx.shared import Mm  # or Inches/Cm
from avantgarde.utils.draw_qr import DrawQR
from avantgarde.models import ContentOrder


class CreateFileToPrint:

    def produce_qr_bytes(self):
        dq = DrawQR()
        html_names = ContentOrder.objects.values_list("html_name", flat=True)
        imgs: list[bytes] = []

        for html in html_names:
            dq.draw_qr(
                url="",
                text="",
                out_file="",
            )

    def create_file_to_print(self):
        tpl = DocxTemplate("template.docx")

        image_bytes = b"...your PNG/JPEG bytes..."
        img_stream = BytesIO(image_bytes)

        context = {
            "my_image": InlineImage(tpl, img_stream, width=Mm(60)),
            # height=Mm(40) also possible
        }

        tpl.render(context)
        tpl.save("out.docx")
