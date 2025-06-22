"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  className?: string;
  height: number;
}

export function PdfViewer({ url, className, height }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  return (
    <Document
      className={cn("pdf-viewer overflow-auto", className)}
      file={url}
      onLoadSuccess={(n) => setNumPages(n.numPages)}
      onLoadError={(error) => console.error("Load Error:", error)}
      onSourceError={(error) => console.error("Source Error:", error)}
    >
      {numPages &&
        Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`${url}_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={false}
            renderTextLayer={true}
            className="border border-zinc-300/70 rounded-sm overflow-clip drop-shadow-xs w-fit"
            onClick={() => console.log("Page clicked")}
            height={height}
          />
        ))}
    </Document>
  );
}

export default PdfViewer;
