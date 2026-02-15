from django.urls import include, path
from avantgarde.views import (
    VerseView,
    RandVerseView,
    ReclamationView,
    ReclamationByNameView,
    ContentOrderView,
    NeologizmView,
)

urlpatterns = [
    path(
        "content_order/<str:html_name>/<str:new>/",
        ContentOrderView.as_view(),
        name="content_order",
    ),
    path("verse/<str:html_name>/", VerseView.as_view(), name="verse"),
    path("rand_verse/", RandVerseView.as_view(), name="rand_verse"),
    path("reclamation/", ReclamationView.as_view(), name="reclamation"),
    path(
        "reclamation/<str:html_name>/",
        ReclamationByNameView.as_view(),
        name="reclamation_by_name",
    ),
    path("neologizm/", NeologizmView.as_view(), name="neologizm"),
]
