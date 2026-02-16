import logging
from django.db import transaction
from avantgarde.models import ContentOrder, RawVerse

STEP_IN_NUMERATION = 10


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
            relevant_html_names.append(verse.html_name)
            titles.append(verse.title)
        return new_orders, relevant_html_names, titles

    def move_non_verse_content(self, max_current_order: int):
        """
        moves non verse content order to last positions

        """
        non_verse_content = ContentOrder.objects.exclude(content="verse")
        for i, item in enumerate(non_verse_content, start=1):
            item.order = max_current_order + STEP_IN_NUMERATION * i
            item.save()

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

        # max existing order, NULL-safe (does NOT treat real 0 as NULL)
        max_order = max((v.order for v in verses if v.order is not None), default=0)

        # temp step must be > max_order so that i*temp_step is always > any existing order
        temp_step = max_order + 10

        with transaction.atomic():
            # Phase 1: move away from current values to avoid UNIQUE collisions
            self._change_order_value(verses, temp_step)
            RawVerse.objects.bulk_update(verses, ["order"])

            # Phase 2: final desired numbering 10, 20, 30, ...
            final_orders, relevant_html_names, titles = self._change_order_value(
                verses, STEP_IN_NUMERATION
            )
            RawVerse.objects.bulk_update(verses, ["order"])

            # add non_verse_content to the end
            max_current_order = 10
            if final_orders:
                max_current_order = max(final_orders)
            self.move_non_verse_content(max_current_order)

            # Rebuild ContentOrder for verses
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
