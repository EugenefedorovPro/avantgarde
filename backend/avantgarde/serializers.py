from django.db.models import fields
from rest_framework.serializers import ModelSerializer
from avantgarde.models import RawVerse, Hermeneutics


class VerseSerializer(ModelSerializer):
    class Meta:
        model = RawVerse
        fields = ["pk", "order", "html_name", "title", "text", "date_of_writing"]


class HermSerializer(ModelSerializer):
    class Meta:
        model = Hermeneutics
        fields = ["pk", "html_name", "title", "text", "date_of_writing"]
