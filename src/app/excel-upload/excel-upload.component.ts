import { Component, ViewChild, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';

interface SheetData {
  name: string;
  data: any[];
  headers: string[];
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  label: string;
}

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  styleUrls: ['./excel-upload.component.css']
})
export class ExcelUploadComponent {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  fileName = '';
  sheets: SheetData[] = [];
  activeSheetIndex = 0;
  isDragging = false;
  showChart = false;
  chartInstance: Chart | null = null;
  chartConfig: ChartConfig = { type: 'bar', label: 'Data' };
  selectedXAxis = '';
  selectedYAxis = '';

  get activeSheet(): SheetData | null {
    return this.sheets[this.activeSheetIndex] || null;
  }

  get numericColumns(): string[] {
    if (!this.activeSheet) return [];
    if (this.activeSheet.data.length === 0) return [];
    
    const firstRow = this.activeSheet.data[0];
    return this.activeSheet.headers.filter(header => {
      const value = firstRow[header];
      return typeof value === 'number' || !isNaN(parseFloat(value));
    });
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
        this.showChart = false;
      }
    };

    reader.readAsBinaryString(file);
  }

  selectSheet(index: number) {
    this.activeSheetIndex = index;
    this.showChart = false;
    this.destroyChart();
  }

  generateChart() {
    if (!this.activeSheet || !this.selectedXAxis || !this.selectedYAxis) {
      alert('Please select both X-axis and Y-axis columns');
      return;
    }

    this.destroyChart();
    this.showChart = true;

    setTimeout(() => {
      this.createChart();
    }, 100);
  }

  private createChart() {
    const canvasElement = document.getElementById('excelChart') as HTMLCanvasElement;
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    const data = this.activeSheet!.data;
    const xAxis = this.selectedXAxis;
    const yAxis = this.selectedYAxis;

    const labels = data.map(row => row[xAxis]);
    const values = data.map(row => {
      const val = row[yAxis];
      return typeof val === 'number' ? val : parseFloat(val);
    });

    const backgroundColors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)'
    ];

    const borderColors = [
      'rgba(75, 192, 192, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ];

    const chartData: any = {
      labels: labels,
      datasets: [
        {
          label: yAxis,
          data: values,
          backgroundColor: this.chartConfig.type === 'bar' ? backgroundColors : backgroundColors[0],
          borderColor: this.chartConfig.type === 'bar' ? borderColors : borderColors[0],
          borderWidth: 1,
          fill: this.chartConfig.type === 'line' ? true : false,
          tension: 0.4
        }
      ]
    };

    const chartOptions: any = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: `${yAxis} vs ${xAxis}`
        }
      },
      scales: this.chartConfig.type === 'pie' || this.chartConfig.type === 'doughnut' ? {} : {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxis
          }
        },
        x: {
          title: {
            display: true,
            text: xAxis
          }
        }
      }
    };

    this.chartInstance = new Chart(ctx, {
      type: this.chartConfig.type,
      data: chartData,
      options: chartOptions
    });
  }

  changeChartType(type: 'line' | 'bar' | 'pie' | 'doughnut') {
    this.chartConfig.type = type;
    if (this.showChart) {
      this.generateChart();
    }
  }

  downloadChart() {
    if (this.chartInstance && this.chartInstance.canvas) {
      const link = document.createElement('a');
      link.href = this.chartInstance.canvas.toDataURL('image/png');
      link.download = `chart-${Date.now()}.png`;
      link.click();
    }
  }

  private destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
