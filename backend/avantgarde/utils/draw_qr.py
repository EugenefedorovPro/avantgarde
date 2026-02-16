from itertools import cycle
from pathlib import Path
import segno
from PIL import Image, ImageDraw, ImageFont
from importlib.resources import files

DEFAULT_FONT = files("qr_code_generator").joinpath("fonts", "NotoSans-Black.ttf")


class DrawQR:

    def __init__(
        self,
        url,
        text,
        out_file,
        font_path=DEFAULT_FONT,
        scale=20,
        font_scale=1.35,
        border=4,
        corner_border=9,
        error_level="h",
    ):
        self.url = url
        self.text = text
        self.out_file = out_file
        self.font_path = font_path
        self.scale = scale
        self.font_scale = font_scale
        self.border = border
        self.error_level = error_level

        self.size = 0
        self.img = None

        self.text_gen = self.make_text_generator()

    def make_text_generator(self):
        prepared_text = "".join(ch for ch in self.text if ch.isalpha())
        return cycle(prepared_text)

    def generate_matrix(self):

        # create qr code object
        # error="h" = high error correction (allows visual distortion)
        qr = segno.make(self.url, error=self.error_level)

        # extract the qr matrix:
        # a 2d list of booleans (true = black module, false = white)
        matrix = qr.matrix
        return matrix

    def prepare_image(self, matrix: tuple[bytearray]):

        # number of modules per side (qr version dependent)
        self.size = len(matrix)

        # calculate image size in pixels:
        # (qr modules + quiet zone) * pixels per module
        image_size = (self.size + 2 * self.border) * self.scale

        # create grayscale image:
        # "l" = 8-bit grayscale
        # 255 = white background
        self.img = Image.new("L", (image_size, image_size), 255)

        # create drawing context
        draw = ImageDraw.Draw(self.img)
        return draw

    def is_finder(self, x, y, size) -> bool:
        """
        returns true if the current module belongs to a qr finder pattern.

        finder patterns are the three big squares in:
        - top-left
        - top-right
        - bottom-left

        we avoid stylizing them so scanners can detect the qr reliably.
        """
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

    def draw_letter(self, px, py, font, draw):
        # center of the module
        cx = px + self.scale // 2
        cy = py + self.scale // 2

        # draw the letter instead of a square
        draw.text(
            (cx, cy),  # position
            next(self.text_gen),
            fill=0,  # black
            font=font,  # bold font
            anchor="mm",  # center alignment
        )

    def render_qr(self, matrix: tuple[bytearray], draw):

        # load font for letter rendering
        # font size slightly larger than cell to fill it visually
        font = ImageFont.truetype(self.font_path, int(self.scale * self.font_scale))

        # iterate through qr matrix rows
        for y, row in enumerate(matrix):

            # iterate through each module in the row
            for x, cell in enumerate(row):

                # if this module is white → do nothing
                if not cell:
                    continue

                # convert qr grid coordinates → pixel coordinates
                px = (x + self.border) * self.scale
                py = (y + self.border) * self.scale

                # if this is a finder-pattern cell
                if self.is_finder(x, y, self.size):

                    # draw solid black square
                    draw.rectangle(
                        [px, py, px + self.scale - 1, py + self.scale - 1], fill=0
                    )

                else:
                    self.draw_letter(px, py, font, draw)

    def draw_qr(self):
        matrix: tuple[bytearray] = self.generate_matrix()
        draw = self.prepare_image(matrix)
        self.render_qr(matrix, draw)

    def save_qr(self):
        # prepare qr image
        self.draw_qr()
        # save final image to disk
        self.img.save(self.out_file)
        # print confirmation
        print(f"saved: {self.out_file}")
