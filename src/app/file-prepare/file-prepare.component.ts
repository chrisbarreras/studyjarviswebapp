// src/app/file-prepare/file-prepare.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-file-prepare',
  templateUrl: './file-prepare.component.html'
})
export class FilePrepareComponent {
  prepareMessage: string;

  constructor(private apiService: ApiService) {}

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
