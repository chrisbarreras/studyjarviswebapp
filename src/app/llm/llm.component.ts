// src/app/llm/llm.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-llm',
  templateUrl: './llm.component.html'
})
export class LlmComponent {
  questionForm: FormGroup;
  questionAnswer: string;
  notes: string;
  keyPoints: string;
  quiz: string;
  studyGuide: string;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.questionForm = this.fb.group({
      question: ['']
    });
  }

  askQuestion() {
    this.apiService.askQuestion(this.questionForm.value).subscribe({
      next: (res: any) => this.questionAnswer = res,
      error: () => this.questionAnswer = 'Failed to get answer.'
    });
  }

  createNotes() {
    this.apiService.createNotes().subscribe({
      next: (res: any) => this.notes = res,
      error: () => this.notes = 'Failed to create notes.'
    });
  }

  createKeyPoints() {
    this.apiService.createKeyPoints().subscribe({
      next: (res: any) => this.keyPoints = res,
      error: () => this.keyPoints = 'Failed to create key points.'
    });
  }

  createQuiz() {
    // Example quiz configuration; you could add a form for custom options
    const quizConfig = { numberOfQuestions: 5 };
    this.apiService.createQuiz(quizConfig).subscribe({
      next: (res: any) => this.quiz = res,
      error: () => this.quiz = 'Failed to create quiz.'
    });
  }

  createStudyGuide() {
    this.apiService.createStudyGuide().subscribe({
      next: (res: any) => this.studyGuide = res,
      error: () => this.studyGuide = 'Failed to create study guide.'
    });
  }
}
