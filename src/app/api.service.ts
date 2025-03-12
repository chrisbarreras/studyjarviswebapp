// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Change the base URL as needed (note the port and base path)
  private baseUrl = 'http://localhost:7000';

  constructor(private http: HttpClient) {}

  // User authentication
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials)
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  // File upload & preparation
  uploadFiles(file: File): Observable<any> {
    const fileReader = new FileReader();

    return new Observable(observer => {
      fileReader.onload = () => {
        const fileData = fileReader.result as ArrayBuffer;

        this.http.post(`${this.baseUrl}/secure/files`, fileData, {
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          responseType: 'text' // Adjust response type if needed
        }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      };

      fileReader.onerror = (error) => observer.error(error);

      // Read the file as ArrayBuffer (binary format)
      fileReader.readAsArrayBuffer(file);
    });
  }

  prepareFiles(): Observable<any> {
    return this.http.post(`${this.baseUrl}/secure/files/prepare`, {});
  }

  // LLM endpoints
  askQuestion(questionConfig: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/ask`, questionConfig, { responseType: 'text' });
  }

  createKeyPoints(): Observable<any> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-key-points`, {}, { responseType: 'text' });
  }

  createNotes(): Observable<any> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-notes`, {}, { responseType: 'text' });
  }

  createQuiz(quizConfig: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-quiz`, quizConfig, { responseType: 'text' });
  }

  createStudyGuide(): Observable<any> {
    return this.http.post(`${this.baseUrl}/secure/jarvis/create-study-guide`, {}, { responseType: 'text' });
  }

  // Additional admin endpoints can be added here...
}
