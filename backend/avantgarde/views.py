import ipdb
import logging
from itertools import cycle
from rest_framework.views import APIView
from django.db.models import Count
from avantgarde.models import (
    Audio,
    RawVerse,
    Hermeneutics,
    HermRandVerse,
    Reclamation,
    AnswerToReclamation,
    ContentOrder,
)
from avantgarde.serializers import (
    VerseSerializer,
    HermSerializer,
    AudioSerializer,
    ReclamationSerializer,
    AnserToReclamationSerializer,
    ContentOrderSerializer,
)
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_404_NOT_FOUND
from django.shortcuts import get_object_or_404
from avantgarde.utils import get_new_order_verse
from avantgarde.utils.rand_verse import RandVerse
from avantgarde.utils.calc_combinations import CalcCombinations
from avantgarde.utils.get_new_order_verse import get_new_order_verse
from avantgarde.utils.populate_content_order import PopulateConteneOrder
from enum import Enum

logger = logging.getLogger(__file__)


class New(Enum):
    CURRENT = "current"
    NEXT = "next"
    PREV = "prev"


NO_CONTENT_MESSAGE = "no content available"


class ContentOrderView(APIView):
    NEW_VALUES = [New.CURRENT.value, New.NEXT.value, New.PREV.value]

    def cycle_order(self, passed_order: int, passed_new: New) -> int | None:
        """
        return previous or next order against the passes order

        """
        orders: list[int] = ContentOrder.objects.order_by("order").values_list(
            "order", flat=True
        )
        if not orders:
            return None

        orders_iter = cycle(orders)

        hit_order: int | None = None
        prev_order = max(orders)
        current_order = None
        for i, ord in enumerate(orders_iter):
            if i != 0:
                prev_order = current_order
            current_order = ord

            # passed_order hit the same number if orders
            if ord == passed_order:
                hit_order = ord
                break

            # to prevent from infinite cycle if passed_order is is not contained in orders
            if i > len(orders):
                break

        # passed_order is is not contained in orders
        if not hit_order:
            return None

        match passed_new:
            case New.PREV:
                return prev_order

            case New.NEXT:
                return next(orders_iter)

            case New.CURRENT:
                return passed_order

            case _:
                return None

    def get(self, request, order: str, new: str):
        """
        1) no current_order, no new, if either of them cannot be converted to int,
        no current_order in db -> return 0 from ContentOrder
        2) if new = current -> return the same as current_order.
        3) if new next -> return next
        4) if prev return  previous
        """
        # if bad request returns the first content item available
        if (
            not order
            or not new
            or not order.isdigit()
            or new not in self.NEW_VALUES
            or not ContentOrder.objects.filter(order=order).exists()
        ):
            content_obj = ContentOrder.objects.order_by("order").first()

            # returns none if no content at all
            if not content_obj:
                data = {"message": NO_CONTENT_MESSAGE}
                return Response(data=data, status=HTTP_404_NOT_FOUND)

            content_ser = ContentOrderSerializer(content_obj)
            return Response(data=content_ser.data, status=HTTP_200_OK)

        # returns actual content
        else:
            new_order: int | None = self.cycle_order(int(order), New(new))
            content_obj = ContentOrder.objects.filter(order=new_order).first()
            content_ser = ContentOrderSerializer(content_obj)
            return Response(data=content_ser.data, status=HTTP_200_OK)


class ReclamationByNameView(APIView):
    def get(self, request, html_name: str):
        recl = get_object_or_404(
            Reclamation.objects.annotate(
                answer_count=Count("answertoreclamation")
            ).filter(answer_count__gt=0),
            html_name=html_name,
        )

        answer = recl.answertoreclamation_set.first()
        if not answer:
            return Response(status=HTTP_404_NOT_FOUND)

        data = {
            "reclamation": ReclamationSerializer(recl).data,
            "answer": AnserToReclamationSerializer(answer).data,
        }
        return Response(data=data, status=HTTP_200_OK)


class ReclamationView(APIView):
    def get(self, request):
        qs = Reclamation.objects.annotate(
            answer_count=Count("answertoreclamation")
        ).filter(answer_count__gt=0)

        recl = qs.order_by("?").first()
        if not recl:
            return Response(status=HTTP_404_NOT_FOUND)
        recl_ser = ReclamationSerializer(recl)

        answer = recl.answertoreclamation_set.first()
        if not answer:
            return Response(status=HTTP_404_NOT_FOUND)
        answer_ser = AnserToReclamationSerializer(answer)

        data = {
            "reclamation": recl_ser.data,
            "answer": answer_ser.data,
        }
        return Response(data=data, status=HTTP_200_OK)


class RandVerseView(APIView):
    def get(self, request):
        rand_verse: dict[int, str] = RandVerse().rand_verse()
        calc = CalcCombinations()
        universe: str = calc.calc_times_longer_than_universe()
        herm = HermRandVerse.objects.first()
        if not rand_verse or not universe or not herm:
            return Response(status=HTTP_404_NOT_FOUND)

        data = {
            "rand_verse": rand_verse,
            "herm": herm.text.format(univ_placeholder=universe),
        }
        return Response(data=data, status=HTTP_200_OK)


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
            new_order = get_new_order_verse(
                cur=current_verse.order, next_to_return=True
            )
            verse = get_object_or_404(RawVerse, order=new_order)
        elif new == "prev":
            new_order = get_new_order_verse(
                cur=current_verse.order, next_to_return=False
            )
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
