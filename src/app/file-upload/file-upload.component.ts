// src/app/file-upload/file-upload.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
  selectedFiles: FileList | null = null;
  uploadMessage: string = "";

  constructor(private apiService: ApiService) {}

  onFileChange(event: any) {
    this.selectedFiles = event.target.files;
  }

  uploadFiles() {
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      const formData: FormData = new FormData();
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('files', this.selectedFiles[i], this.selectedFiles[i].name);
      }
      this.apiService.uploadFiles(formData).subscribe({
        next: () => {
          this.uploadMessage = 'Files uploaded successfully!';
        },
        error: () => {
          this.uploadMessage = 'Upload failed.';
        }
      });
    }
  }
}
