from django.urls import include, path
from avantgarde.views import VerseView

urlpatterns = [
    path("verse/<str:order>/<str:new>/", VerseView.as_view(), name="verse"),
]
