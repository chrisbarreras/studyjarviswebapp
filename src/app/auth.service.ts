import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;

  // Call this method upon successful login
  setToken(token: string): void {
    this.token = token;
    // Optionally, persist it in local storage
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    // Retrieve from in-memory storage or local storage
    return this.token || localStorage.getItem('authToken');
  }
}
