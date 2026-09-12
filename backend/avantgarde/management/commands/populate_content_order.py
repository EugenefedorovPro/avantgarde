from django.core.management import BaseCommand

from avantgarde.utils.populate_content_order import PopulateContentOrder


class Command(BaseCommand):
    help = (
        "Unify RawVerse orders as 10, 20, 30, etc., then populate ContentOrder "
        "with the resulting verse sequence."
    )

    def handle(self, *args, **kwwargs):
        PopulateContentOrder().populate_content_order()
