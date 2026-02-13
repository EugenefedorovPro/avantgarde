# avantgarde/management/commands/dump_verses_herm.py

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from avantgarde.models import RawVerse, Hermeneutics


class Command(BaseCommand):
    def handle(self, *args, **options):
        out_path = Path(settings.BASE_DIR).parent / "verses_herm.txt"

        with out_path.open("w", encoding="utf-8") as f:
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

        self.stdout.write(f"Wrote {out_path}")
