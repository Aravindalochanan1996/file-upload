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
  isPasswordProtected = false;
  password = '';
  passwordError = '';
  pdfData: Uint8Array | null = null;

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

  onSelectClick(fileInput: HTMLInputElement) {
    fileInput.click();
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
    this.passwordError = '';
    this.isPasswordProtected = false;
    this.password = '';
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      // Convert ArrayBuffer to Uint8Array to avoid detached ArrayBuffer issues
      this.pdfData = new Uint8Array(e.target.result);
      await this.loadPDF();
    };

    reader.onerror = () => {
      this.error = 'Error reading file';
      this.isLoading = false;
    };

    reader.readAsArrayBuffer(file);
  }

  private async loadPDF(password: string = '') {
    if (!this.pdfData) return;

    try {
      // Create a fresh copy of the PDF data to avoid ArrayBuffer detachment issues
      const pdfOptions: any = {
        data: new Uint8Array(this.pdfData),
        password: password
      };

      const pdf = await pdfjsLib.getDocument(pdfOptions).promise;
      this.totalPages = pdf.numPages;
      this.pdfPages = [];
      this.isPasswordProtected = false;
      this.passwordError = '';
      this.error = '';

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
      console.log('PDF loaded successfully');
    } catch (err: any) {
      console.log('Error name:', err.name);
      console.log('Error message:', err.message);
      
      // Check if it's a password-related error
      if (err.name === 'PasswordException') {
        this.isPasswordProtected = true;
        this.isLoading = false;
        this.error = '';
        // Set the specific error message for wrong password
        if (this.password.length > 0) {
          this.passwordError = '✗ Incorrect password. Please try again.';
        } else {
          this.passwordError = 'Please enter a password';
        }
      } else {
        this.error = `Error reading PDF: ${err.message}`;
        this.isLoading = false;
        this.isPasswordProtected = false;
      }
    }
  }

  submitPassword() {
    if (!this.password.trim()) {
      this.passwordError = 'Please enter a password';
      return;
    }

    this.isLoading = true;
    this.passwordError = '';
    console.log('Submitting password...');
    this.loadPDF(this.password);
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
