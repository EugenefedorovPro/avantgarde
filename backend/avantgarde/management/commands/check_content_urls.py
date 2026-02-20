# avantgarde/management/commands/check_content_urls.py
# Run: python manage.py check_content_urls

from django.core.management.base import BaseCommand
from avantgarde.models import ContentOrder

import requests  # pip install requests


class Command(BaseCommand):
    help = "Check that ContentOrder.html_for_qr URLs are accessible (prints HTTP status)."

    def handle(self, *args, **options):
        # Get all URLs from DB (skip empty ones)
        urls = [
            u for (u,) in ContentOrder.objects.values_list("html_for_qr") if u
        ]

        # Check each URL
        for i, url in enumerate(urls, start=1):
            try:
                # GET request (follows redirects), timeout in seconds
                r = requests.get(url, timeout=10, allow_redirects=True)
                # Print: index, HTTP code, url
                self.stdout.write(f"{i:02d} {r.status_code} {url}")
            except requests.RequestException as e:
                # Any network/timeout/DNS/SSL error
                self.stdout.write(f"{i:02d} ERR {url} ({e.__class__.__name__})")
