import logging
from avantgarde.models import RawVerse
from itertools import cycle

logger = logging.getLogger(__file__)


def get_new_order_verse(cur: int, next_to_return: bool) -> int | None:
    if next_to_return:
        orders: list[int] = list(
            RawVerse.objects.order_by("order").values_list("order", flat=True)
        )
    else:
        orders: list[int] = list(
            RawVerse.objects.order_by("-order").values_list("order", flat=True)
        )

    if not any(orders):
        logger.error(f"No orders in verses")
        return

    order_iter = cycle(orders)

    while True:
        current = next(order_iter)
        if current == cur:
            return next(order_iter)
