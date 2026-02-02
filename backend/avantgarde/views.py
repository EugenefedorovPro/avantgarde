import ipdb
import logging
from itertools import cycle
from rest_framework.views import APIView
from avantgarde.models import Audio, RawVerse, Hermeneutics
from avantgarde.serializers import VerseSerializer, HermSerializer, AudioSerializer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_404_NOT_FOUND
from django.shortcuts import get_object_or_404
from avantgarde.utils.rand_verse import RandVerse

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


class RandVerseView(APIView):
    def get(self, request):
        rand_verse: dict[int, str] = RandVerse().rand_verse()
        if not rand_verse:
            return Response(status=HTTP_404_NOT_FOUND)
        return Response(data=rand_verse, status=HTTP_200_OK)


class VerseView(APIView):

    def get(self, request, order, new):
        current_verse = None
        # secure if order cannot be converted to number
        try:
            current_verse = RawVerse.objects.filter(order=order).first()
        except ValueError:
            pass

        # secure if the requested order is not available
        if not current_verse:
            current_verse = RawVerse.objects.order_by("order").first()

        # secure if no verse in db at all
        if not current_verse:
            # not found it not verses at all in db
            data = {"verse": None, "herm": None, "audio": None}
            return Response(data=data, status=HTTP_404_NOT_FOUND)

        # _____________________ verse ________________________
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

        # _____________________ herm_______________________
        herm = Hermeneutics.objects.filter(raw_verses=verse).first()
        data["herm"] = None
        if herm:
            herm_ser = HermSerializer(herm)
            data["herm"] = herm_ser.data

        # _____________________ audio________________________
        audio = Audio.objects.filter(raw_verses=verse).first()
        data["audio"] = None
        if audio:
            audio_ser = AudioSerializer(audio)
            data["audio"] = audio_ser.data

        return Response(data=data, status=HTTP_200_OK)
