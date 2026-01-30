import ipdb
import logging
from itertools import cycle
from rest_framework.views import APIView
from avantgarde.models import RawVerse, Hermeneutics
from avantgarde.serializers import VerseSerializer, HermSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from django.shortcuts import get_object_or_404

logger = logging.getLogger(__file__)


def get_new_order(cur: int, next_to_return: bool) -> int | None:
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


class VerseView(APIView):

    def get(self, request, html_name, new):
        current_verse = get_object_or_404(RawVerse, html_name=html_name)

        if new == "current":
            verse = current_verse
        elif new == "next":
            new_order = get_new_order(cur=current_verse.order, next_to_return=True)
            verse = get_object_or_404(RawVerse, order=new_order)
        elif new == "prev":
            new_order = get_new_order(cur=current_verse.order, next_to_return=False)
            verse = get_object_or_404(RawVerse, order=new_order)
        else:
            verse = current_verse

        verse_ser = VerseSerializer(verse)

        data = {"verse": verse_ser.data}

        herm = Hermeneutics.objects.filter(raw_verses = verse).first()
        if not herm:
            data["herm"] =  {}
        else:
            herm_ser = HermSerializer(herm)
            data["herm"] = herm_ser.data

        return Response(data=data, status=HTTP_200_OK)
