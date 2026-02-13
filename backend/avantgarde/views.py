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
from avantgarde.utils.populate_content_order import PopulateContentOrder
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
        orders: list[int] = ContentOrder.objects.order_by("order").values_list(
            "order", flat=True
        )
        if not orders:
            return None

        orders_iter = cycle(orders)

        hit_order: int | None = None
        prev_order = max(orders)
        current_order = None

        for i, ord_ in enumerate(orders_iter):
            if i != 0:
                prev_order = current_order
            current_order = ord_

            if ord_ == passed_order:
                hit_order = ord_
                break

            if i > len(orders):
                break

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

    def get(self, request, html_name: str, new: str):
        # bad request -> return first content item available
        if not html_name or not new or new not in self.NEW_VALUES:
            content_obj = ContentOrder.objects.order_by("order").first()
            if not content_obj:
                return Response(
                    {"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND
                )
            return Response(
                ContentOrderSerializer(content_obj).data, status=HTTP_200_OK
            )

        current_obj = ContentOrder.objects.filter(html_name=html_name).first()
        if not current_obj:
            content_obj = ContentOrder.objects.order_by("order").first()
            if not content_obj:
                return Response(
                    {"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND
                )
            return Response(
                ContentOrderSerializer(content_obj).data, status=HTTP_200_OK
            )

        new_order: int | None = self.cycle_order(current_obj.order, New(new))
        if new_order is None:
            return Response({"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND)

        content_obj = ContentOrder.objects.filter(order=new_order).first()
        if not content_obj:
            return Response({"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND)

        return Response(ContentOrderSerializer(content_obj).data, status=HTTP_200_OK)


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
    def get(self, request, html_name: str):
        verse = None

        # treat these as "no selection"
        if not html_name or html_name == "noHtmlName":
            verse = RawVerse.objects.order_by("order").first()
        else:
            verse = RawVerse.objects.filter(html_name=html_name).first()

            # fallback if requested html_name not found
            if not verse:
                verse = RawVerse.objects.order_by("order").first()

        if not verse:
            data = {"verse": None, "herm": None, "audio": None}
            return Response(data=data, status=HTTP_404_NOT_FOUND)

        verse_ser = VerseSerializer(verse)
        data = {"verse": verse_ser.data}

        herm = Hermeneutics.objects.filter(raw_verses=verse).first()
        data["herm"] = HermSerializer(herm).data if herm else None

        audio = Audio.objects.filter(raw_verses=verse).first()
        data["audio"] = AudioSerializer(audio).data if audio else None

        return Response(data=data, status=HTTP_200_OK)
