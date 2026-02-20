import os
import logging
from django.db import transaction
from avantgarde.models import ContentOrder, RawVerse

STEP_IN_NUMERATION = 10
BASE_URL = os.getenv("BASE_URL", "")


class PopulateContentOrder:
    def _change_order_value(
        self, verses: list[RawVerse], step: int
    ) -> tuple[list[int], list[str], list[str | None]]:
        """
        renumerates verses by changing order field but keeping their sequence intact:
        e. g. 1,2,5 -> 10, 20, 30.
        """
        new_orders: list[int] = []
        relevant_html_names: list[str] = []
        titles: list[str] = []
        for i, verse in enumerate(verses, start=1):
            new_order = i * step
            verse.order = new_order
            new_orders.append(new_order)
            html_n = f"{BASE_URL}/verse/{verse.html_name}/"
            relevant_html_names.append(html_n)
            titles.append(verse.title)
        return new_orders, relevant_html_names, titles

    def add_base_url_to_non_verse(self, non_verse_content: list[ContentOrder]) -> None:
        for item in non_verse_content:
            item.html_name = f"{BASE_URL}/{item.html_name}"

    def move_non_verse_content(self, max_current_order: int) -> None:
        """
        moves non verse content order to last positions (safe for UNIQUE order)
        and prefixes BASE_URL to their html_name
        """
        non_verse_content = list(
            ContentOrder.objects.exclude(content="verse")
            .only("pk", "order", "html_name")  # ✅ need html_name to update it
            .order_by("pk")
        )
        if not non_verse_content:
            return

        # ✅ prefix BASE_URL and persist it
        self.add_base_url_to_non_verse(non_verse_content)
        ContentOrder.objects.bulk_update(non_verse_content, ["html_name"])

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
            self._change_order_value(verses, temp_step)
            RawVerse.objects.bulk_update(verses, ["order"])

            final_orders, relevant_html_names, titles = self._change_order_value(
                verses, STEP_IN_NUMERATION
            )
            RawVerse.objects.bulk_update(verses, ["order"])

            max_current_order = 10
            if final_orders:
                max_current_order = max(final_orders)
            self.move_non_verse_content(max_current_order)

            ContentOrder.objects.filter(content="verse").delete()
            ContentOrder.objects.bulk_create(
                [
                    ContentOrder(
                        order=o, content="verse", html_name=html, qr_text=title
                    )
                    for o, html, title in zip(final_orders, relevant_html_names, titles)
                ]
            )

        logging.info("Content order was populated with verse orders = %s", final_orders)
        return None
