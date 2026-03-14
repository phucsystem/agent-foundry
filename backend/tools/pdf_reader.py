"""PDF reader tool — extracts and chunks text from PDF files."""

import logging
from typing import Any

from tools.base import BaseTool
from tools.registry import tool_registry

logger = logging.getLogger(__name__)

_CHUNK_CHARS = 2048
_OVERLAP_RATIO = 0.1


class PDFReaderTool(BaseTool):
    """Extract and chunk text from PDF files."""

    name = "pdf_reader"
    description = "Extract and chunk text from PDF files"

    async def execute(self, **kwargs: Any) -> str:
        file_path = kwargs.get("file_path", "")
        if not file_path:
            return "No file_path provided."

        logger.debug("PDF extraction requested: file_path=%r", file_path)

        try:
            text = self._extract_text(file_path)
            chunks = self._chunk_text(text)
            if not chunks:
                return f"No text extracted from {file_path}."

            preview = "\n---\n".join(chunks[:5])
            return f"Extracted {len(chunks)} chunks from {file_path}\n\n{preview}"
        except Exception as error:
            logger.error("PDF extraction failed for %r: %s", file_path, error)
            return f"PDF extraction failed: {error}"

    def _extract_text(self, file_path: str) -> str:
        """Extract text from PDF using pypdf."""
        try:
            from pypdf import PdfReader
        except ImportError:
            return "pypdf not installed. Run: pip install pypdf"

        reader = PdfReader(file_path)
        pages = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                pages.append(page_text)

        return "\n\n".join(pages)

    def _chunk_text(
        self,
        text: str,
        chunk_chars: int = _CHUNK_CHARS,
        overlap_ratio: float = _OVERLAP_RATIO,
    ) -> list[str]:
        """Split text into overlapping fixed-size chunks."""
        if not text:
            return []

        overlap = int(chunk_chars * overlap_ratio)
        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_chars
            chunks.append(text[start:end])
            start = end - overlap

        return chunks


tool_registry.register(PDFReaderTool())
