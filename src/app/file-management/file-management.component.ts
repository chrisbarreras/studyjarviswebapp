import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.css']
})
export class FileManagementComponent {
  selectedFiles: FileList | null = null;
  uploadedFiles: { name: string }[] = [];
  uploadMessage: string = "";
  prepareMessage: string = "";
  loading: boolean = false;

  constructor(private apiService: ApiService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = input.files;
    }
  }

  uploadFiles(): void {
    const files = this.selectedFiles;

    if (!files || files.length === 0) {
      this.uploadMessage = "No files selected.";
      return;
    }

    this.loading = true; // Show loading overlay

    this.apiService.uploadFiles(files).subscribe({
      next: () => {
        const uploadedFiles = Array.from(files).map(file => ({ name: file.name }));
        this.uploadedFiles.push(...uploadedFiles);

        this.updateUploadMessage(uploadedFiles.length, 0);
        this.loading = false; // Hide loading overlay
      },
      error: () => {
        this.updateUploadMessage(0, files.length);
        this.loading = false; // Hide loading overlay
      }
    });
  }

  private updateUploadMessage(success: number, failed: number) {
    this.uploadMessage = `Uploaded: ${success}, Failed: ${failed}`;
  }

  prepareFiles() {
    this.loading = true; // Show loading overlay

    this.apiService.prepareFiles().subscribe({
      next: () => {
        this.prepareMessage = 'Files prepared successfully!';
        this.loading = false; // Hide loading overlay
      },
      error: () => {
        this.prepareMessage = 'File preparation failed.';
        this.loading = false; // Hide loading overlay
      }
    });
  }

  hasFailures(): boolean {
    return this.uploadMessage.includes('Failed:') && /Failed: [1-9]/.test(this.uploadMessage);
  }
}
