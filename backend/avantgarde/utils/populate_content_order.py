import os
import logging
from django.db import transaction
from avantgarde.models import ContentOrder, RawVerse

STEP_IN_NUMERATION = 10
BASE_URL = os.getenv("BASE_URL", "").rstrip("/")  # avoid double slashes


class PopulateContentOrder:
    def _change_order_value(
        self, verses: list[RawVerse], step: int
    ) -> tuple[list[int], list[str], list[str], list[str | None]]:
        """
        renumerates verses by changing order field but keeping their sequence intact:
        e. g. 1,2,5 -> 10, 20, 30.
        """
        new_orders: list[int] = []
        html_names: list[str] = []        # slug, no BASE_URL
        html_for_qr: list[str] = []       # full url with BASE_URL
        titles: list[str] = []

        for i, verse in enumerate(verses, start=1):
            new_order = i * step
            verse.order = new_order
            new_orders.append(new_order)

            slug = verse.html_name
            html_names.append(slug)
            html_for_qr.append(f"{BASE_URL}/verse/{slug}/")

            titles.append(verse.title)

        return new_orders, html_names, html_for_qr, titles

    def add_base_url_to_non_verse(self, non_verse_content: list[ContentOrder]) -> None:
        for item in non_verse_content:
            # If your non-verse html_name is a slug like "rand_verse" and your route is "/<slug>/"
            # adjust the path here if needed (e.g. "/api/..." or "/print/pdf/").
            item.html_for_qr = f"{BASE_URL}/{item.html_name}/"

    def move_non_verse_content(self, max_current_order: int) -> None:
        """
        moves non verse content order to last positions (safe for UNIQUE order)
        and fills html_for_qr with BASE_URL
        """
        non_verse_content = list(
            ContentOrder.objects.exclude(content="verse")
            .only("pk", "order", "html_name", "html_for_qr")
            .order_by("pk")
        )
        if not non_verse_content:
            return

        # set html_for_qr (leave html_name unchanged)
        self.add_base_url_to_non_verse(non_verse_content)
        ContentOrder.objects.bulk_update(non_verse_content, ["html_for_qr"])

        # Phase 1: move non-verse to a temporary safe range to avoid UNIQUE collisions
        current_max = (
            ContentOrder.objects.order_by("-order")
            .values_list("order", flat=True)
            .first()
        )
        current_max = current_max if current_max is not None else 0
        intended_max = max_current_order + STEP_IN_NUMERATION * len(non_verse_content)
        temp_base = max(current_max, intended_max) + 1000

        for i, item in enumerate(non_verse_content, start=1):
            item.order = temp_base + i
        ContentOrder.objects.bulk_update(non_verse_content, ["order"])

        # Phase 2: move non-verse to the end (final values)
        for i, item in enumerate(non_verse_content, start=1):
            item.order = max_current_order + STEP_IN_NUMERATION * i
        ContentOrder.objects.bulk_update(non_verse_content, ["order"])

    def populate_content_order(self) -> None:
        """
        One atomic operation:
        1) renumber RawVerse.order to 10,20,30,...
           (with a temp renumber first to avoid UNIQUE collisions)
        2) rebuild ContentOrder rows for content="verse"
        """
        verses = list(
            RawVerse.objects.order_by("order", "pk").only(
                "pk", "order", "html_name", "title"
            )
        )
        if not verses:
            logging.warning("No verses in db")
            return None

        max_order = max((v.order for v in verses if v.order is not None), default=0)
        temp_step = max_order + 10

        with transaction.atomic():
            # Phase 1: move away from current values to avoid UNIQUE collisions
            self._change_order_value(verses, temp_step)
            RawVerse.objects.bulk_update(verses, ["order"])

            # Phase 2: final desired numbering 10, 20, 30, ...
            final_orders, html_names, html_for_qr, titles = self._change_order_value(
                verses, STEP_IN_NUMERATION
            )
            RawVerse.objects.bulk_update(verses, ["order"])

            # add non_verse_content to the end
            max_current_order = max(final_orders) if final_orders else 10
            self.move_non_verse_content(max_current_order)

            # Rebuild ContentOrder for verses
            ContentOrder.objects.filter(content="verse").delete()
            ContentOrder.objects.bulk_create(
                [
                    ContentOrder(
                        order=o,
                        content="verse",
                        html_name=slug,          # ✅ keep slug
                        html_for_qr=url,         # ✅ full url for QR
                        qr_text=title,
                    )
                    for o, slug, url, title in zip(final_orders, html_names, html_for_qr, titles)
                ]
            )

        logging.info("Content order was populated with verse orders = %s", final_orders)
        return None
