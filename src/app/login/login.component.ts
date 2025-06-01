import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      password: ['']
    });
  }

  hasAnyInput(): boolean {
    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;
    return !!(username && username.trim() !== '' || password && password.trim() !== '');
  }

  onSubmit() {
    if (!this.hasAnyInput()) {
      return; // Prevent submission if no input
    }
    console.log("Login Attempt");
    this.apiService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        const authToken = response.authToken + "";
        this.authService.setToken(authToken);
        this.router.navigate(['/manage']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = 'Invalid credentials';
      }
    });
  }
}
