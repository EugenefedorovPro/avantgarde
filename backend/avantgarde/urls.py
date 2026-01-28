from django.urls import include, path
from avantgarde.views import VerseView

urlpatterns = [
    path("verse/<str:html_name>/<str:new>/", VerseView.as_view(), name="verse"),
]
