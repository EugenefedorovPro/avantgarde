from django.urls import include, path
from avantgarde.views import VerseView, RandVerseView, ReclamationView

urlpatterns = [
    path("verse/<str:order>/<str:new>/", VerseView.as_view(), name="verse"),
    path("rand_verse/", RandVerseView.as_view(), name="rand_verse"),
    path("reclamation/", ReclamationView.as_view(), name="reclamation"),
]
