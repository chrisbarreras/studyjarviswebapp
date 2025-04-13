import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FileManagementComponent } from './file-management/file-management.component';
import { LlmComponent } from './llm/llm.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'manage', component: FileManagementComponent },
  { path: 'llm', component: LlmComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
