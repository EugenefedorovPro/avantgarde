import logging
import tempfile
from enum import Enum
from io import BytesIO
from pathlib import Path

from django.core.cache import cache
from django.db.models import Count
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from rest_framework.views import APIView

from avantgarde.models import (
    Audio,
    ContentOrder,
    Hermeneutics,
    HermRandVerse,
    HermToHistory,
    HermToMakeCopy,
    HistoryTime,
    RawVerse,
    Reclamation,
)
from avantgarde.serializers import (
    AnswerToReclamationSerializer,
    AudioSerializer,
    ContentOrderSerializer,
    HermSerializer,
    HermToHistorySerializer,
    HermToMakeCopySerializer,
    HistoryTimeSerializer,
    ReclamationSerializer,
    VerseSerializer,
)
from avantgarde.utils.calc_combinations import CalcCombinations
from avantgarde.utils.create_file_to_print import CreateFileToPrint
from avantgarde.utils.create_neologism import CreateNeologism, Harmony
from avantgarde.utils.rand_verse import RandVerse

logger = logging.getLogger(__name__)


class New(Enum):
    CURRENT = "current"
    NEXT = "next"
    PREV = "prev"


NO_CONTENT_MESSAGE = "no content available"
PDF_CACHE_KEY = "printable-qr-pdf-v1"
PDF_CACHE_SECONDS = 300


class PrintQrTextView(APIView):
    def get(self, request):
        herm_obj = HermToMakeCopy.objects.first()
        if not herm_obj:
            return Response(status=HTTP_404_NOT_FOUND)

        herm_ser = HermToMakeCopySerializer(herm_obj)
        data = {
            "herm": herm_ser.data,
        }
        return Response(data=data, status=HTTP_200_OK)


class PrintQrPdfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        pdf_bytes = cache.get(PDF_CACHE_KEY)

        try:
            if not isinstance(pdf_bytes, bytes):
                creator = CreateFileToPrint()
                with tempfile.TemporaryDirectory() as tmp_dir:
                    docx_path = str(Path(tmp_dir) / "qr_print.docx")
                    _, pdf_path = creator.create_file_to_print(
                        out_path=docx_path, also_pdf=True
                    )
                    if not pdf_path:
                        raise RuntimeError("PDF was not generated")

                    pdf_bytes = Path(pdf_path).read_bytes()
                cache.set(PDF_CACHE_KEY, pdf_bytes, PDF_CACHE_SECONDS)

            response = FileResponse(
                BytesIO(pdf_bytes),
                as_attachment=True,
                filename="qr_print.pdf",
                content_type="application/pdf",
            )
            response["Content-Length"] = len(pdf_bytes)
            response["Cache-Control"] = f"public, max-age={PDF_CACHE_SECONDS}"
            return response
        except Exception:
            logger.exception("Failed to generate the printable QR PDF")
            return Response(
                {"detail": "PDF generation failed"},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NeologizmView(APIView):
    def get(self, request):
        years_objs = HistoryTime.objects.order_by("order", "pk")
        years_ser = HistoryTimeSerializer(years_objs, many=True)

        creator = CreateNeologism()
        n_words = years_objs.count()
        harmony_words = creator.create_neologizm(Harmony.HARMONY, n_words)
        disharmony_words = creator.create_neologizm(Harmony.DISHARMONY, n_words)
        spontaneity_words = creator.create_neologizm(Harmony.SPONTANEITY, n_words)

        herm_obj = HermToHistory.objects.first()

        data = {
            "harmony_words": harmony_words,
            "disharmony_words": disharmony_words,
            "spontaneity_words": spontaneity_words,
            "years": years_ser.data,
            "herm": HermToHistorySerializer(herm_obj).data if herm_obj else None,
        }
        return Response(data=data, status=HTTP_200_OK)


class ContentOrderView(APIView):
    NEW_VALUES = (New.CURRENT.value, New.NEXT.value, New.PREV.value)

    def cycle_order(self, passed_order: int, passed_new: New) -> int | None:
        orders = list(
            ContentOrder.objects.filter(order__isnull=False)
            .order_by("order")
            .values_list("order", flat=True)
        )
        if not orders:
            return None

        try:
            current_index = orders.index(passed_order)
        except ValueError:
            return None

        match passed_new:
            case New.PREV:
                return orders[(current_index - 1) % len(orders)]
            case New.NEXT:
                return orders[(current_index + 1) % len(orders)]
            case New.CURRENT:
                return passed_order
            case _:
                return None

    def get(self, request, html_name: str, new: str):
        # bad request -> return first content item available
        if not html_name or not new or new not in self.NEW_VALUES:
            content_obj = (
                ContentOrder.objects.filter(order__isnull=False)
                .order_by("order")
                .first()
            )
            if not content_obj:
                return Response(
                    {"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND
                )
            return Response(
                ContentOrderSerializer(content_obj).data, status=HTTP_200_OK
            )

        current_obj = ContentOrder.objects.filter(html_name=html_name).first()
        if not current_obj:
            content_obj = (
                ContentOrder.objects.filter(order__isnull=False)
                .order_by("order")
                .first()
            )
            if not content_obj:
                return Response(
                    {"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND
                )
            return Response(
                ContentOrderSerializer(content_obj).data, status=HTTP_200_OK
            )

        if current_obj.order is None:
            return Response({"message": NO_CONTENT_MESSAGE}, status=HTTP_404_NOT_FOUND)

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
            Reclamation.objects.annotate(answer_count=Count("answers")).filter(
                answer_count__gt=0
            ),
            html_name=html_name,
        )

        answer = recl.answers.first()
        if not answer:
            return Response(status=HTTP_404_NOT_FOUND)

        data = {
            "reclamation": ReclamationSerializer(recl).data,
            "answer": AnswerToReclamationSerializer(answer).data,
        }
        return Response(data=data, status=HTTP_200_OK)


class ReclamationView(APIView):
    def get(self, request):
        qs = Reclamation.objects.annotate(answer_count=Count("answers")).filter(
            answer_count__gt=0
        )

        recl = qs.order_by("?").first()
        if not recl:
            return Response(status=HTTP_404_NOT_FOUND)
        recl_ser = ReclamationSerializer(recl)

        answer = recl.answers.first()
        if not answer:
            return Response(status=HTTP_404_NOT_FOUND)
        answer_ser = AnswerToReclamationSerializer(answer)

        data = {
            "reclamation": recl_ser.data,
            "answer": answer_ser.data,
        }
        return Response(data=data, status=HTTP_200_OK)


class RandVerseView(APIView):
    def get(self, request):
        rand_verse: dict[str, str] = RandVerse().rand_verse()
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
        verse = get_object_or_404(RawVerse, html_name=html_name)

        verse_ser = VerseSerializer(verse)
        data = {"verse": verse_ser.data}

        herm = Hermeneutics.objects.filter(raw_verses=verse).first()
        data["herm"] = HermSerializer(herm).data if herm else None

        audio = (
            Audio.objects.filter(raw_verses=verse)
            .exclude(audio__isnull=True)
            .exclude(audio="")
            .first()
        )
        data["audio"] = AudioSerializer(audio).data if audio else None

        return Response(data=data, status=HTTP_200_OK)
