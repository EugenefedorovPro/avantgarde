import ipdb
from avantgarde.utils.populate_content_order import PopulateConteneOrder
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.models import RawVerse, ContentOrder


class TestPopulateContentOrder(CreateTestVerses):

    def test_unify_verse_order_success(self):
        new_verse_order: list[int] | None = PopulateConteneOrder().unify_verse_order()
        actual: list[int] = list(RawVerse.objects.values_list("order", flat=True))
        print(new_verse_order)
        self.assertEqual(new_verse_order, actual)
        self.assertEqual(
            actual,
            list(range(10, 110, 10)),
        )

    def test_unify_verse_order_none(self):
        RawVerse.objects.all().delete()
        new_verse_order: list[int] | None = PopulateConteneOrder().unify_verse_order()
        self.assertTrue(new_verse_order == None)

    def test_populate_content_order(self):
        PopulateConteneOrder().populate_content_order()
        content_order: list[tuple[int, str]] = list(
            ContentOrder.objects.values_list("order", "content")
        )
        expected = [
            (10, "verse"),
            (20, "verse"),
            (30, "verse"),
            (40, "verse"),
            (50, "verse"),
            (60, "verse"),
            (70, "verse"),
            (80, "verse"),
            (90, "verse"),
            (100, "verse"),
        ]
        print(f"content_order = {expected}")
        self.assertEqual(expected, content_order)

