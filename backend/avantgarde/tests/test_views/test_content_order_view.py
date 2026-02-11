import ipdb
from avantgarde.utils import populate_content_order
from avantgarde.views import ContentOrderView, New
from avantgarde.tests.create_test_verses import CreateTestVerses
from avantgarde.models import ContentOrder
from unittest import skip


class TestContentOrderView(CreateTestVerses):

    def populate_content_order(self):
        content_types = ["rand_verse"] + ["verse"] * 8 + ["end"]
        order_objs = []
        for i, c_type in zip(range(10, 110, 10), content_types):
            order_objs.append(
                ContentOrder(
                    order=i,
                    content=c_type,
                )
            )
        ContentOrder.objects.bulk_create(order_objs)

    def test_cycle_order(self):
        self.populate_content_order()
        print(ContentOrder.objects.values_list("order", "content"))
        cov = ContentOrderView()

        next_order = cov.cycle_order(passed_order=80, passed_new=New.NEXT)
        self.assertEqual(next_order, 90)

        next_order = cov.cycle_order(100, New.NEXT)
        self.assertEqual(next_order, 10)

        prev_order = cov.cycle_order(70, New.PREV)
        self.assertEqual(prev_order, 60)

        prev_order = cov.cycle_order(10, New.PREV)
        self.assertEqual(prev_order, 100)

        no_order = cov.cycle_order(15, New.NEXT)
        self.assertEqual(no_order, None)

        current_order = cov.cycle_order(20, New.CURRENT)
        self.assertEqual(current_order, 20)

    def test_incorrect_request(self):
        self.populate_content_order()

        # no 15 in order
        url = "/content_order/15/next/"
        response = self.client.get(url)
        self.assertEqual(response.data, {"pk": 1, "order": 10, "content": "rand_verse"})

        # incorrect new arg: previous instead of prev
        url = "/content_order/10/previous/"
        response = self.client.get(url)
        self.assertEqual(response.data, {"pk": 1, "order": 10, "content": "rand_verse"})

    def test_correct_request(self):
        self.populate_content_order()

        url = "/content_order/10/next/"
        response = self.client.get(url)
        print(f"response_data = {response.data}")
        self.assertEqual(response.data, {"pk": 2, "order": 20, "content": "verse"})

        url = "/content_order/100/next/"
        response = self.client.get(url)
        self.assertEqual(response.data, {"pk": 1, "order": 10, "content": "rand_verse"})

        url = "/content_order/10/prev/"
        response = self.client.get(url)
        self.assertEqual(response.data, {"pk": 10, "order": 100, "content": "end"})
