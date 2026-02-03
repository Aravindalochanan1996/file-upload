import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

interface SheetData {
  name: string;
  data: any[];
  headers: string[];
}

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  styleUrls: ['./excel-upload.component.css']
})
export class ExcelUploadComponent {
  fileName = '';
  sheets: SheetData[] = [];
  activeSheetIndex = 0;
  isDragging = false;

  get activeSheet(): SheetData | null {
    return this.sheets[this.activeSheetIndex] || null;
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
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.processFile(file);
      } else {
        alert('Please drop an Excel file (.xlsx or .xls)');
      }
    }
  }

  private processFile(file: File) {
    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      this.sheets = [];

      workbook.SheetNames.forEach((sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const headers = data.length > 0 ? Object.keys(data[0] as Record<string, any>) : [];

        this.sheets.push({
          name: sheetName,
          data: data,
          headers: headers
        });
      });

      if (this.sheets.length > 0) {
        this.activeSheetIndex = 0;
      }
    };

    reader.readAsBinaryString(file);
  }

  selectSheet(index: number) {
    this.activeSheetIndex = index;
  }
}
