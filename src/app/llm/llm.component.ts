// src/app/llm/llm.component.ts
import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-llm',
  templateUrl: './llm.component.html',
  styleUrls: ['./llm.component.css'], // If needed
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LlmComponent {
  questionForm: FormGroup;
  questionAnswer: string = "";
  notes: string = "";
  keyPoints: string = '';
  quiz: string = "";
  studyGuide: string = "";

  isLoading: boolean = false;

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.questionForm = this.fb.group({
      question: ['']
    });
  }

  askQuestion() {
    this.isLoading = true;
    this.apiService.askQuestion(this.questionForm.value).subscribe({
      next: (res: any) => this.questionAnswer = res,
      error: () => this.questionAnswer = 'Failed to get answer.',
      complete: () => this.isLoading = false
    });
  }

  createNotes() {
    this.isLoading = true;
    this.apiService.createNotes().subscribe({
      next: (res: any) => this.notes = res,
      error: () => this.notes = 'Failed to create notes.',
      complete: () => this.isLoading = false
    });
  }

  createKeyPoints() {
    this.isLoading = true;
    this.apiService.createKeyPoints().subscribe({
      next: (res: any) => this.keyPoints = res,
      error: () => this.keyPoints = 'Failed to create key points.',
      complete: () => this.isLoading = false
    });
  }

  createQuiz() {
    this.isLoading = true;
    const quizConfig = { numberOfQuestions: 5 };
    this.apiService.createQuiz(quizConfig).subscribe({
      next: (res: any) => this.quiz = res,
      error: () => this.quiz = 'Failed to create quiz.',
      complete: () => this.isLoading = false
    });
  }

  createStudyGuide() {
    this.isLoading = true;
    this.apiService.createStudyGuide().subscribe({
      next: (res: any) => this.studyGuide = res,
      error: () => this.studyGuide = 'Failed to create study guide.',
      complete: () => this.isLoading = false
    });
  }

  isAskButtonEnabled(): boolean {
    return this.questionForm.get('question')?.value?.trim().length > 0;
  }
}
