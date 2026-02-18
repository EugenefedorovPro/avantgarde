import ipdb

from itertools import cycle
from pathlib import Path
from typing import Iterable, Iterator, Optional, Sequence

import segno
from PIL import Image, ImageDraw, ImageFont
from importlib.resources import files

# DEFAULT_FONT = files("qr_code_generator").joinpath("fonts", "NotoSans-Black.ttf")
DEFAULT_FONT = Path(__file__).parent / "fonts" / "NotoSans-Black.ttf"

# Segno matrix behaves like: rows -> columns -> bool (True=dark module)
Matrix = Sequence[Sequence[bool]]


class DrawQR:
    def __init__(
        self,
        font_path=DEFAULT_FONT,
        scale: int = 20,
        font_scale: float = 1.35,
        border: int = 4,
        corner_border: int = 9,  # kept (unused in your current code)
        error_level: str = "h",
    ) -> None:
        self.font_path = font_path
        self.scale = scale
        self.font_scale = font_scale
        self.border = border
        self.corner_border = corner_border
        self.error_level = error_level

        # per-render state (initialized in draw_qr)
        self.size: int = 0
        self.img: Optional[Image.Image] = None
        self._text_gen: Optional[Iterator[str]] = None

    def _make_text_generator(self, text: str) -> Iterator[str]:
        prepared_text = "".join(ch for ch in text if ch.isalpha())
        if not prepared_text:
            # fail fast: your renderer requires letters
            raise ValueError("`text` must contain at least one alphabetic character.")
        return cycle(prepared_text)

    def generate_matrix(self, url: str) -> Matrix:
        qr = segno.make(url, error=self.error_level)
        return qr.matrix  # sequence of rows; each row sequence of booleans

    def prepare_image(self, matrix: Matrix) -> ImageDraw.ImageDraw:
        self.size = len(matrix)

        image_size = (self.size + 2 * self.border) * self.scale
        self.img = Image.new("L", (image_size, image_size), 255)

        return ImageDraw.Draw(self.img)

    def is_finder(self, x: int, y: int, size: int) -> bool:
        # Finder + separator
        if (x < 8 and y < 8) or (x >= size - 8 and y < 8) or (x < 8 and y >= size - 8):
            return True

        # Timing patterns
        if x == 6 or y == 6:
            return True

        # Format info area
        if x == 8 or y == 8:
            return True

        return False

    def draw_letter(
        self, px: int, py: int, font: ImageFont.FreeTypeFont, draw: ImageDraw.ImageDraw
    ) -> None:
        if self._text_gen is None:
            raise RuntimeError(
                "Text generator is not initialized. Call draw_qr() first."
            )

        cx = px + self.scale // 2
        cy = py + self.scale // 2

        draw.text(
            (cx, cy),
            next(self._text_gen),
            fill=0,
            font=font,
            anchor="mm",
        )

    def render_qr(self, matrix: Matrix, draw: ImageDraw.ImageDraw) -> None:
        font = ImageFont.truetype(
            str(self.font_path), int(self.scale * self.font_scale)
        )

        for y, row in enumerate(matrix):
            for x, cell in enumerate(row):
                if not cell:
                    continue

                px = (x + self.border) * self.scale
                py = (y + self.border) * self.scale

                if self.is_finder(x, y, self.size):
                    draw.rectangle(
                        [px, py, px + self.scale - 1, py + self.scale - 1], fill=0
                    )
                else:
                    self.draw_letter(px, py, font, draw)

    def draw_qr(self, url: str, text: str, out_file: str | Path | None = None) -> bytes:
        """
        Render QR into PNG bytes.
        If out_file is provided, also write the PNG there.
        """
        self._text_gen = self._make_text_generator(text)

        matrix = self.generate_matrix(url)
        draw = self.prepare_image(matrix)
        self.render_qr(matrix, draw)

        if self.img is None:
            raise RuntimeError("Image was not created.")

        # export to PNG bytes
        from io import BytesIO

        buf = BytesIO()
        self.img.save(buf, format="PNG")
        png_bytes = buf.getvalue()

        if out_file is not None:
            Path(out_file).write_bytes(png_bytes)

        return png_bytes
