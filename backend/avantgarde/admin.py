from django.contrib import admin
from django.db.models import Count

from .models import (
    RawVerse,
    EuPro,
    Hermeneutics,
    Audio,
    Reclamation,
    AnswerToReclamation,
    HermRandVerse,
)


@admin.register(HermRandVerse)
class HermRandVerseAdmin(admin.ModelAdmin):
    list_display = ("text", "html_name")


class AnswerToReclamationInline(admin.TabularInline):
    model = AnswerToReclamation
    extra = 0
    fields = ("text", "repeat")
    show_change_link = False


@admin.register(Reclamation)
class ReclamationAdmin(admin.ModelAdmin):
    list_display = ("text", "html_name", "answers_count")
    inlines = (AnswerToReclamationInline,)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # If you DID set related_name="answers" on the FK, replace with Count("answers")
        return qs.annotate(_answers_count=Count("answertoreclamation"))

    @admin.display(description="Answers", ordering="_answers_count")
    def answers_count(self, obj):
        return obj._answers_count


class RawVersesAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Форма", {"fields": ("order", "html_name", "title", "date_of_writing")}),
        ("Содержание", {"fields": ("text",)}),
    ]
    list_display = ("order", "title", "html_name", "date_of_writing")
    search_fields = ("text", "title", "html_name")


class EuProAdmin(admin.ModelAdmin):
    list_display = ("title", "html_name", "date_of_writing", "text")
    search_fields = ("title", "html_name")


class HermeneuticsAdmin(admin.ModelAdmin):
    fieldsets = [
        ("Форма", {"fields": ("html_name", "title", "raw_verses", "date_of_writing")}),
        ("Содержание", {"fields": ("text",)}),
    ]
    list_display = ("title", "raw_verses", "html_name", "date_of_writing")
    search_fields = ("text", "title", "html_name")


admin.site.register(RawVerse, RawVersesAdmin)
admin.site.register(EuPro, EuProAdmin)
admin.site.register(Hermeneutics, HermeneuticsAdmin)
admin.site.register(Audio)

# AnswerToReclamation is NOT registered separately; manage it via Reclamation inline.
