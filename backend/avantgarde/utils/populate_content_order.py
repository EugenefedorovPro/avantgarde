from avantgarde.models import ContentOrder, RawVerse

STEP_IN_NUMERATION = 10


class PopulateConteneOrder:

    def unify_verse_order(self) -> list[int] | None:
        """
        get all orders from RawVerses -> make them uniform: start from 10, step of numeration. e.g. 10,20,30
        """
        verses = RawVerse.objects.order_by("order").only("order")
        if not verses:
            return None

        new_verse_order = []
        for i, verse in enumerate(verses, start=1):
            new_order = i * STEP_IN_NUMERATION
            verse.order = new_order
            verse.save()
            new_verse_order.append(new_order)
        return new_verse_order

    def populate_content_order(self) -> None:
        """
        entrypoint method
        calls unify_verse_order
        and populate ContentOrder with new orders of verses in the format:  dict[int, "verse"]
        """
        orders: list[int] | None = self.unify_verse_order()
        if not orders:
            return None

        content_objs = []
        for order in orders:
            content_objs.append(
                ContentOrder(
                    order=order,
                    content="verse",
                )
            )
        ContentOrder.objects.bulk_create(content_objs)
        return None

