# avantgarde/management/commands/dump_reclamations.py

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from avantgarde.models import Reclamation, AnswerToReclamation


class Command(BaseCommand):
    def handle(self, *args, **options):
        out_path = Path(settings.BASE_DIR) / "reclamations.txt"

        with out_path.open("w", encoding="utf-8") as f:
            f.write("=== Reclamation ===\n")
            for row in Reclamation.objects.values():  # all fields
                for k, v in row.items():
                    f.write(f"{k}: {v}\n")
                f.write("-----\n")

            f.write("\n=== AnswerToReclamation ===\n")
            for row in AnswerToReclamation.objects.values():  # all fields incl reclamation_id
                for k, v in row.items():
                    f.write(f"{k}: {v}\n")
                f.write("-----\n")

        self.stdout.write(f"Wrote {out_path}")

