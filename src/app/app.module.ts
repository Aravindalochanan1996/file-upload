import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ExcelUploadComponent } from './excel-upload/excel-upload.component';
import { PDFUploadComponent } from './pdf-upload/pdf-upload.component';

@NgModule({
  declarations: [AppComponent, ExcelUploadComponent, PDFUploadComponent],
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
