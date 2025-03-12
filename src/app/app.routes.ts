import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FilePrepareComponent } from './file-prepare/file-prepare.component';
import { LlmComponent } from './llm/llm.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'upload', component: FileUploadComponent },
  { path: 'prepare', component: FilePrepareComponent },
  { path: 'llm', component: LlmComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
