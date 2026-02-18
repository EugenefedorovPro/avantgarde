import ipdb
import logging
from itertools import cycle
from rest_framework.views import APIView
from django.db.models import Count
from avantgarde.models import (
    Audio,
    HistoryTime,
    RawVerse,
    Hermeneutics,
    HermRandVerse,
    Reclamation,
    ContentOrder,
    HistoryTime,
    HermToHistory,
    HermToMakeCopy,
)
from avantgarde.serializers import (
    VerseSerializer,
    HermSerializer,
    AudioSerializer,
    ReclamationSerializer,
    AnserToReclamationSerializer,
    ContentOrderSerializer,
    HistoryTimeSerializer,
    HermToHistorySerializer,
    HermToMakeCopySerializer,

)
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_404_NOT_FOUND
from django.shortcuts import get_object_or_404
from avantgarde.utils import get_new_order_verse
from avantgarde.utils.create_neologism import CreateNeologism, Harmony
from avantgarde.utils.rand_verse import RandVerse
from avantgarde.utils.calc_combinations import CalcCombinations
from avantgarde.utils.get_new_order_verse import get_new_order_verse
from avantgarde.utils.populate_content_order import PopulateContentOrder
from enum import Enum
import os
import tempfile
from pathlib import Path

from django.http import FileResponse
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_500_INTERNAL_SERVER_ERROR
from rest_framework.views import APIView

from avantgarde.utils.create_file_to_print import CreateFileToPrint

logger = logging.getLogger(__file__)


class New(Enum):
    CURRENT = "current"
    NEXT = "next"
    PREV = "prev"


NO_CONTENT_MESSAGE = "no content available"


class PrintQrTextView(APIView):
    def get(self, response):
        herm_obj = HermToMakeCopy.objects.first()
        herm_ser = HermToHistorySerializer(herm_obj)
        data = {
            "herm": herm_ser.data,
        }
        return Response(data=data, status=HTTP_200_OK)

class PrintQrPdfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        creator = CreateFileToPrint()

        tmp_dir = tempfile.mkdtemp()
        docx_path = str(Path(tmp_dir) / "qr_print.docx")

        try:
            _, pdf_path = creator.create_file_to_print(
                out_path=docx_path, also_pdf=True
            )
            if not pdf_path:
                return Response(
                    {"detail": "PDF was not generated"},
                    status=HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return FileResponse(
                open(pdf_path, "rb"),
                as_attachment=True,
                filename="qr_print.pdf",
                content_type="application/pdf",
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # best-effort cleanup (docx/pdf + temp dir)
            try:
                for p in Path(tmp_dir).glob("*"):
                    try:
                        p.unlink()
                    except Exception:
                        pass
                try:
                    Path(tmp_dir).rmdir()
                except Exception:
                    pass
            except Exception:
                pass


class NeologizmView(APIView):
    def get(self, request):
        years_objs = HistoryTime.objects.all()
        years_ser = HistoryTimeSerializer(years_objs, many=True)

        CreateN = CreateNeologism()
        n_words = years_objs.count()
        harmony_words = CreateN.create_neologizm(Harmony.HARMONY, n_words)
        disharmony_words = CreateN.create_neologizm(Harmony.DISHARMONY, n_words)
        spontaneity_words = CreateN.create_neologizm(Harmony.SPONTANEITY, n_words)

        herm_obj = HermToHistory.objects.first()
        herm_ser = HermToHistorySerializer(herm_obj)

        data = {
            "harmony_words": harmony_words,
            "disharmony_words": disharmony_words,
            "spontaneity_words": spontaneity_words,
            "years": years_ser.data,
            "herm": herm_ser.data,
        }
        print(f"NeologizmView = {data}")
        return Response(data=data, status=HTTP_200_OK)


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

        if hit_order == None:
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
