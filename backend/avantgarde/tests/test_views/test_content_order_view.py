from django.urls import reverse

from avantgarde.models import ContentOrder
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.views import ContentOrderView, New


class TestContentOrderView(CreateTestVerses):
    def populate_content_order(self):
        content_types = ["rand_verse"] + ["verse"] * 8 + ["end"]
        order_objs = []
        for i, content_type in zip(range(10, 110, 10), content_types):
            order_objs.append(
                ContentOrder(
                    order=i,
                    content=content_type,
                    html_name=f"html_name_{i}",
                )
            )
        ContentOrder.objects.bulk_create(order_objs)

    def test_cycle_order(self):
        self.populate_content_order()
        view = ContentOrderView()

        self.assertEqual(view.cycle_order(80, New.NEXT), 90)
        self.assertEqual(view.cycle_order(100, New.NEXT), 10)
        self.assertEqual(view.cycle_order(70, New.PREV), 60)
        self.assertEqual(view.cycle_order(10, New.PREV), 100)
        self.assertIsNone(view.cycle_order(15, New.NEXT))
        self.assertEqual(view.cycle_order(20, New.CURRENT), 20)

    def test_incorrect_request_returns_first_content(self):
        self.populate_content_order()

        url = reverse(
            "content_order", kwargs={"html_name": "missing", "new": New.NEXT.value}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                "pk": 1,
                "order": 10,
                "content": "rand_verse",
                "html_name": "html_name_10",
            },
        )

        url = reverse(
            "content_order", kwargs={"html_name": "html_name_10", "new": "previous"}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {
                "pk": 1,
                "order": 10,
                "content": "rand_verse",
                "html_name": "html_name_10",
            },
        )

    def test_correct_request(self):
        self.populate_content_order()

        url = reverse(
            "content_order",
            kwargs={"html_name": "html_name_10", "new": New.NEXT.value},
        )
        response = self.client.get(url)
        self.assertEqual(
            response.data,
            {"pk": 2, "order": 20, "content": "verse", "html_name": "html_name_20"},
        )

        url = reverse(
            "content_order",
            kwargs={"html_name": "html_name_100", "new": New.NEXT.value},
        )
        response = self.client.get(url)
        self.assertEqual(
            response.data,
            {
                "pk": 1,
                "order": 10,
                "content": "rand_verse",
                "html_name": "html_name_10",
            },
        )

        url = reverse(
            "content_order",
            kwargs={"html_name": "html_name_10", "new": New.PREV.value},
        )
        response = self.client.get(url)
        self.assertEqual(
            response.data,
            {"pk": 10, "order": 100, "content": "end", "html_name": "html_name_100"},
        )
