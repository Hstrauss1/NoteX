import unittest
import os
from tempfile import NamedTemporaryFile
from note import is_valid_pdf_file_path 

class TestPDFUpload(unittest.TestCase):

    def test_empty_pdf(self):
        with NamedTemporaryFile(suffix=".pdf", delete=True) as f:
            f.flush()
            self.assertFalse(is_valid_pdf_file_path(f.name))

    def test_non_pdf_file(self):
        with NamedTemporaryFile(suffix=".txt", delete=True) as f:
            f.write(b"Hello world")
            f.flush()
            self.assertFalse(is_valid_pdf_file_path(f.name))

    def test_valid_pdf(self):
        with NamedTemporaryFile(suffix=".pdf", delete=True) as f:
            f.write(b"%PDF-1.4 valid")
            f.flush()
            self.assertTrue(is_valid_pdf_file_path(f.name))

    def test_missing_file(self):
        fake_path = "/tmp/does_not_exist_1234.pdf"
        self.assertFalse(os.path.exists(fake_path))  # Just to be sure
        self.assertFalse(is_valid_pdf_file_path(fake_path))

    def test_wrong_mime_but_pdf_ext(self):
        with NamedTemporaryFile(suffix=".pdf", delete=True) as f:
            f.write(b"not a real PDF, but named .pdf")
            f.flush()
            self.assertTrue(is_valid_pdf_file_path(f.name))  
