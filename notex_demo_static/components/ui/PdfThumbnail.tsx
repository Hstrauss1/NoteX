"use client";

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

export default function PdfThumbnail({ url, height }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  return (
    <div className="relative w-fit h-fit">
      <div className="absolute bg-neutral-100 dark:bg-neutral-800 h-full w-full rotate-6 rounded-sm top-0 border border-neutral-300/70 dark:border-neutral-700/70 drop-shadow-xs" />
      <div className="w-fit h-fit">
        <Document
          file={url}
          onLoadSuccess={(n) => setNumPages(n.numPages)}
          onLoadError={(error) => console.error("Load Error:", error)}
          onSourceError={(error) => console.error("Source Error:", error)}
        >
          <Page
            pageNumber={1}
            renderAnnotationLayer={false}
            renderTextLayer={true}
            className="border border-neutral-300/70 dark:border-neutral-700/70 rounded-sm overflow-clip drop-shadow-xs"
            onClick={() => console.log("Page clicked")}
            height={height}
          />
        </Document>
      </div>
      <div className="absolute bottom-0 text-xs py-1.5 px-2 rounded-b-sm w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300/70 dark:border-neutral-700/70 flex items-center gap-1 justify-center">
        {numPages} Pages
      </div>
    </div>
  );
}
