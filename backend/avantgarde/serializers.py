from django.db.models import fields
from rest_framework.serializers import ModelSerializer
from avantgarde.models import (
    RawVerse,
    Hermeneutics,
    Audio,
    Reclamation,
    AnswerToReclamation,
    ContentOrder,
)


class ContentOrderSerializer(ModelSerializer):
    class Meta:
        model = ContentOrder
        fields = ["pk", "order", "content", "html_name"]

class ReclamationSerializer(ModelSerializer):
    class Meta:
        model = Reclamation
        fields = ["pk", "text", "html_name"]


class AnserToReclamationSerializer(ModelSerializer):
    class Meta:
        model = AnswerToReclamation
        fields = ["pk", "text", "repeat"]


class VerseSerializer(ModelSerializer):
    class Meta:
        model = RawVerse
        fields = ["pk", "order", "html_name", "title", "text", "date_of_writing"]


class HermSerializer(ModelSerializer):
    class Meta:
        model = Hermeneutics
        fields = ["pk", "html_name", "title", "text", "date_of_writing"]


class AudioSerializer(ModelSerializer):
    class Meta:
        model = Audio
        fields = ["pk", "audio", "html_name"]
