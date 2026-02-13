# avantgarde/management/commands/dump_verses_herm_txt.py

from django.core.management.base import BaseCommand
from avantgarde.models import RawVerse, Hermeneutics


class Command(BaseCommand):
    def handle(self, *args, **options):
        with open("verses_herm.txt", "w", encoding="utf-8") as f:
            f.write("=== RawVerse ===\n")
            for row in RawVerse.objects.values():  # all fields
                for k, v in row.items():
                    f.write(f"{k}: {v}\n")
                f.write("-----\n")

            f.write("\n=== Hermeneutics ===\n")
            for row in Hermeneutics.objects.values():  # all fields
                for k, v in row.items():
                    f.write(f"{k}: {v}\n")
                f.write("-----\n")

        self.stdout.write("Wrote verses_herm.txt")
