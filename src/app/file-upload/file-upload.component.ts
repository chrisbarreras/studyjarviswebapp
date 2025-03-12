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
      let uploadedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];

        this.apiService.uploadFiles(file).subscribe({
          next: () => {
            uploadedCount++;
            this.updateUploadMessage(uploadedCount, failedCount);
          },
          error: () => {
            failedCount++;
            this.updateUploadMessage(uploadedCount, failedCount);
          }
        });
      }
    }
  }

  private updateUploadMessage(success: number, failed: number) {
    this.uploadMessage = `Uploaded: ${success}, Failed: ${failed}`;
  }
}
