import { Component } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFPage {
  pageNumber: number;
  canvas: HTMLCanvasElement | null;
}

@Component({
  selector: 'app-pdf-upload',
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.css']
})
export class PDFUploadComponent {
  fileName = '';
  pdfPages: PDFPage[] = [];
  currentPageIndex = 0;
  totalPages = 0;
  isDragging = false;
  isLoading = false;
  error = '';

  // Set the worker source
  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  get currentPage(): PDFPage | null {
    return this.pdfPages[this.currentPageIndex] || null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        this.processFile(file);
      } else {
        this.error = 'Please drop a PDF file (.pdf)';
        setTimeout(() => this.error = '', 3000);
      }
    }
  }

  private processFile(file: File) {
    this.fileName = file.name;
    this.isLoading = true;
    this.error = '';
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
        this.totalPages = pdf.numPages;
        this.pdfPages = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            const viewport = page.getViewport({ scale: 2 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
          }

          this.pdfPages.push({
            pageNumber: pageNum,
            canvas: canvas
          });
        }

        if (this.pdfPages.length > 0) {
          this.currentPageIndex = 0;
        }
        this.isLoading = false;
      } catch (err: any) {
        this.error = `Error reading PDF: ${err.message}`;
        this.isLoading = false;
      }
    };

    reader.onerror = () => {
      this.error = 'Error reading file';
      this.isLoading = false;
    };

    reader.readAsArrayBuffer(file);
  }

  goToPage(pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < this.pdfPages.length) {
      this.currentPageIndex = pageIndex;
    }
  }

  previousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
    }
  }

  nextPage() {
    if (this.currentPageIndex < this.pdfPages.length - 1) {
      this.currentPageIndex++;
    }
  }

  jumpToPage(pageNumber: number) {
    const index = pageNumber - 1;
    if (index >= 0 && index < this.pdfPages.length) {
      this.currentPageIndex = index;
    }
  }
}
