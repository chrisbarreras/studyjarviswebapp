import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-file-management',
  standalone: true, // Ensures it works in a standalone environment
  imports: [CommonModule], // Required for *ngFor
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.css']
})
export class FileManagementComponent {
  selectedFiles: FileList | null = null;
  uploadedFiles: { name: string }[] = []; // To display uploaded files
  uploadMessage: string = "";
  prepareMessage: string = "";

  constructor(private apiService: ApiService) {}

  // Handles file selection
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = input.files;
    }
  }

  // Handles file uploads
  uploadFiles() {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      this.uploadMessage = "No files selected.";
      return;
    }

    let uploadedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < this.selectedFiles.length; i++) {
      const file = this.selectedFiles[i];

      this.apiService.uploadFiles(file).subscribe({
        next: () => {
          uploadedCount++;
          this.uploadedFiles.push({ name: file.name }); // Display uploaded files
          this.updateUploadMessage(uploadedCount, failedCount);
        },
        error: () => {
          failedCount++;
          this.updateUploadMessage(uploadedCount, failedCount);
        }
      });
    }
  }

  private updateUploadMessage(success: number, failed: number) {
    this.uploadMessage = `Uploaded: ${success}, Failed: ${failed}`;
  }

  // Handles file preparation
  prepareFiles() {
    this.apiService.prepareFiles().subscribe({
      next: () => {
        this.prepareMessage = 'Files prepared successfully!';
      },
      error: () => {
        this.prepareMessage = 'File preparation failed.';
      }
    });
  }
}
