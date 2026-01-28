from django.db.models import fields
from rest_framework.serializers import ModelSerializer
from avantgarde.models import RawVerse


class VerseSerializer(ModelSerializer):
    class Meta:
        model = RawVerse
        fields = ["pk", "order", "html_name", "title", "text", "date_of_writing"]
