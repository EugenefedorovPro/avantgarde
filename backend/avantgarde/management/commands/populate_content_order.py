from django.core.management import BaseCommand
from avantgarde.utils.populate_content_order import PopulateContentOrder


class Command(BaseCommand):
    help = "1) unify orders in RawVerse: 10, 20, 30, etc. 2) populates ContentOrder with: {10: 'verse'}, etc,"

    def handle(self, *args, **kwwargs):
        PopulateContentOrder().populate_content_order()

