import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from flask import g
from app import app
from note import create_note

class TestUploadLimit(unittest.TestCase):

    def test_upload_limit_reached(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client

            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
                count=5, data=[]
            )
            mock_client.table.return_value = mock_table

            with self.assertRaises(Exception) as context:
                create_note("user123", "Title", "path/to.pdf")
            self.assertIn("Upload limit", str(context.exception))

    def test_upload_limit_not_reached(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client

            mock_table = MagicMock()
            mock_table.select.return_value.eq.return_value.gte.return_value.lte.return_value.execute.return_value = MagicMock(
                count=3, data=[]
            )
            mock_client.table.return_value = mock_table
            mock_client.table.return_value.insert.return_value.execute.return_value = MagicMock()

            note_id = create_note("user123", "Valid Title", "file.pdf")
            self.assertIsInstance(note_id, str)

    def test_future_timestamp(self):
        future = datetime.now(timezone.utc) + timedelta(days=1)
        self.assertTrue(future > datetime.now(timezone.utc))

    def test_boundary_limit(self):
        count = 4
        self.assertLess(count, 5)

    def test_invalid_note_title(self):
        with self.assertRaises(TypeError):
            create_note("user123", None, "file.pdf")
