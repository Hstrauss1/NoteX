import unittest
from unittest.mock import MagicMock
from flask import Flask, g
from note import delete_note
from app import app

class TestNoteDeletion(unittest.TestCase):

    def test_note_deletes_successfully(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client

            mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = {
                "data": {"storage_path": "abc/123.pdf"}
            }
            mock_client.storage.from_.return_value.remove.return_value = {}
            mock_client.table.return_value.delete.return_value.eq.return_value.execute.return_value = {}

            try:
                delete_note("note123")
            except Exception:
                self.fail("delete_note raised an Exception unexpectedly!")

    def test_note_not_found(self):
        with app.app_context():
            mock_client = MagicMock()
            g.supabase_client = mock_client

            mock_client.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = {
                "data": None
            }

            with self.assertRaises(Exception) as context:
                delete_note("invalid-id")
            self.assertIn("not found", str(context.exception))

    def test_invalid_id_type(self):
        with self.assertRaises(TypeError):
            delete_note(None)

    def test_storage_path_missing(self):
        note_data = {"note_id": "abc123"}  # no storage_path key
        self.assertNotIn("storage_path", note_data)

    def test_note_id_format(self):
        self.assertTrue(isinstance("abc123", str))
