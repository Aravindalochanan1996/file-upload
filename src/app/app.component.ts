import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <div class="header">
        <h1>File Upload & Viewer</h1>
      </div>
      <div class="content">
        <div class="tab-selector">
          <button 
            (click)="activeTab = 'excel'"
            [class.active]="activeTab === 'excel'"
            class="tab-button">
            📊 Excel Upload
          </button>
          <button 
            (click)="activeTab = 'pdf'"
            [class.active]="activeTab === 'pdf'"
            class="tab-button">
            📄 PDF Viewer
          </button>
        </div>
        <div class="tab-content">
          <app-excel-upload *ngIf="activeTab === 'excel'"></app-excel-upload>
          <app-pdf-upload *ngIf="activeTab === 'pdf'"></app-pdf-upload>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 300;
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .tab-selector {
      display: flex;
      border-bottom: 2px solid #eee;
    }

    .tab-button {
      flex: 1;
      padding: 15px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
    }

    .tab-button:hover {
      background: #efefef;
    }

    .tab-button.active {
      background: white;
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .tab-content {
      padding: 30px;
      min-height: 500px;
    }
  `]
})
export class AppComponent {
  activeTab = 'excel';
}
