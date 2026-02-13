from django.urls import include, path
from avantgarde.views import (
    VerseView,
    RandVerseView,
    ReclamationView,
    ReclamationByNameView,
    ContentOrderView,
)

urlpatterns = [
    path(
        "content_order/<str:order>/<str:new>/",
        ContentOrderView.as_view(),
        name="content_order",
    ),
    path("verse/<str:order>/", VerseView.as_view(), name="verse"),
    path("rand_verse/", RandVerseView.as_view(), name="rand_verse"),
    path("reclamation/", ReclamationView.as_view(), name="reclamation"),
    path(
        "reclamation/<str:html_name>/",
        ReclamationByNameView.as_view(),
        name="reclamation_by_name",
    ),
]
