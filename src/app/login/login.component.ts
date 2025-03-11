// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone:true
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  onSubmit() {
    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Save user details as needed (e.g., in localStorage or a user service)
        this.router.navigate(['/upload']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = 'Invalid credentials';
      }
    });
  }
}
