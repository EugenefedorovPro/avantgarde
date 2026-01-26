from django.contrib import admin
from .models import (
    RawVerses,
    EuPro,
    Hermeneutics,
    Audio,
    Reclamation,
    AnswerToReclamation,
)


@admin.register(Reclamation)
class ReclamationAdmin(admin.ModelAdmin):
    list_display = ["text", "html_name"]


@admin.register(AnswerToReclamation)
class AnswerToReclamationAdmin(admin.ModelAdmin):
    list_display = ["text"]


class RawVersesAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Форма", {"fields": ["html_name", "title", "date_of_writing"]}),
        ("Содержание", {"fields": ["text"]}),
    ]
    list_display = ["title", "html_name", "date_of_writing"]
    search_fields = ["text", "title", "html_name"]


class EuProAdmin(admin.ModelAdmin):
    list_display = ["title", "html_name", "date_of_writing", "text"]
    search_fields = ["title", "title", "html_name"]


class HermeneuticsAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Форма", {"fields": ["html_name", "title", "raw_verses", "date_of_writing"]}),
        ("Содержание", {"fields": ["text"]}),
    ]
    list_display = ["title", "raw_verses", "html_name", "date_of_writing"]
    search_fields = ["text", "title", "html_name"]


admin.site.register(RawVerses, RawVersesAdmin)
admin.site.register(EuPro, EuProAdmin)
admin.site.register(Hermeneutics, HermeneuticsAdmin)
admin.site.register(Audio)
