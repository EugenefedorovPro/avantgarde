import ipdb
import os
from django.test import TestCase
from avantgarde.utils.create_file_to_print import CreateFileToPrint
from avantgarde.models import RawVerse, ContentOrder
from django.urls import reverse


class TestCreateFileToPrint(TestCase):
    fixtures = ["content_order.json"]

    def test_one_file(self):
        CreateF = CreateFileToPrint()
        CreateF.create_file_to_print()
        self.assertTrue(1)
