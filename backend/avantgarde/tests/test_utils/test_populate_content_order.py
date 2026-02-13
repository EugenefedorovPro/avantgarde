import ipdb
from avantgarde.utils.populate_content_order import PopulateContentOrder
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.models import RawVerse, ContentOrder


class TestPopulateContentOrder(CreateTestVerses):
    @staticmethod
    def expected_content_orders() -> list[tuple[int, str]]:
        return [(i, "verse") for i in range(10, 110, 10)]

    @staticmethod
    def get_content_orders() -> list[tuple[int, str]]:
        return list(
            ContentOrder.objects.order_by("order").values_list("order", "content")
        )

    @staticmethod
    def get_verse_orders() -> list[int]:
        return list(RawVerse.objects.order_by("order").values_list("order", flat=True))

    def assert_orders_ok(self):
        self.assertEqual(list(range(10, 110, 10)), self.get_verse_orders())
        self.assertEqual(self.expected_content_orders(), self.get_content_orders())

    def test_html_names_all_present(self):
        PopulateContentOrder().populate_content_order()
        expected = [
            "html_name_0",
            "html_name_1",
            "html_name_2",
            "html_name_3",
            "html_name_4",
            "html_name_5",
            "html_name_6",
            "html_name_7",
            "html_name_8",
            "html_name_9",
        ]
        self.assertEqual(
            expected, list(ContentOrder.objects.values_list("html_name", flat=True))
        )

    def test_populate_content_order_success_unique_collision_scenario(self):
        # create a potential unique-renumbering collision scenario
        first = RawVerse.objects.first()
        if first:
            first.save()

        last = RawVerse.objects.last()
        if last:
            last.order = 10
            last.save()

        PopulateContentOrder().populate_content_order()
        self.assert_orders_ok()

    def test_populate_content_order_none(self):
        RawVerse.objects.all().delete()

        PopulateContentOrder().populate_content_order()

        self.assertEqual([], self.get_verse_orders())
        self.assertEqual([], self.get_content_orders())

    def test_populate_content_order_all_null_orders(self):
        RawVerse.objects.update(order=None)

        PopulateContentOrder().populate_content_order()
        self.assert_orders_ok()

    def test_populate_content_order_one_null_order(self):
        v = RawVerse.objects.first()
        if v:
            v.order = None
            v.save()

        PopulateContentOrder().populate_content_order()
        self.assert_orders_ok()

    def test_populate_content_order_default(self):
        PopulateContentOrder().populate_content_order()
        self.assert_orders_ok()

