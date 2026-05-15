import { ChangeDetectionStrategy, Component, computed, EventEmitter, HostListener, inject, input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CheckCircle2, XCircle, RotateCcw, Sparkles, ArrowRight, HelpCircle } from 'lucide-angular';
import { Quiz, Question } from '../../core/models';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './quiz-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizCardComponent {
  readonly quiz = input.required<Quiz>();
  @Output() quizChanged = new EventEmitter<Quiz>();
  @Output() retake = new EventEmitter<void>();
  @Output() harder = new EventEmitter<void>();

  private readonly api = inject(ApiService);

  readonly selectedKey = signal<string | null>(null);
  readonly freeAnswer = signal<string>('');
  readonly evaluating = signal<boolean>(false);
  readonly justSubmitted = signal<boolean>(false);

  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly RotateCcw = RotateCcw;
  readonly Sparkles = Sparkles;
  readonly ArrowRight = ArrowRight;
  readonly HelpCircle = HelpCircle;

  readonly current = computed<Question | undefined>(() => this.quiz().questions[this.quiz().currentIndex]);
  readonly total = computed<number>(() => this.quiz().questions.length);
  readonly score = computed<number>(() => this.quiz().questions.filter(q => q.correct).length);
  readonly percentage = computed<number>(() => Math.round((this.score() / Math.max(this.total(), 1)) * 100));

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.quiz().completed) return;
    const q = this.current();
    if (!q) return;
    const target = event.target as HTMLElement | null;
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
    if (q.choices) {
      const digit = Number(event.key);
      if (!isNaN(digit) && digit >= 1 && digit <= q.choices.length) {
        event.preventDefault();
        const key = q.choices[digit - 1].key;
        this.selectedKey.set(key);
      } else if (event.key === 'Enter') {
        if (!q.answered) { event.preventDefault(); this.submit(); }
        else { event.preventDefault(); this.next(); }
      }
    } else if (event.key === 'Enter' && event.ctrlKey) {
      if (!q.answered) { event.preventDefault(); this.submit(); }
    }
  }

  selectChoice(key: string): void {
    const q = this.current();
    if (!q || q.answered) return;
    this.selectedKey.set(key);
  }

  submit(): void {
    const q = this.current();
    if (!q || q.answered) return;
    if (q.choices) {
      const chosen = this.selectedKey();
      if (!chosen) return;
      const isCorrect = !!q.correctKey && chosen.toUpperCase() === q.correctKey.toUpperCase();
      this.markAnswered(q, chosen, isCorrect);
    } else {
      const answer = this.freeAnswer().trim();
      if (!answer) return;
      this.evaluating.set(true);
      const expected = q.correctKey ?? q.explanation ?? '';
      const prompt = `You are grading a short-answer study question.\n\nQuestion: ${q.stem}\nExpected answer: ${expected}\nStudent answer: ${answer}\n\nReply on the first line with exactly CORRECT or INCORRECT, then a one-sentence explanation on the next line.`;
      this.api.askQuestion({ question: prompt }).subscribe({
        next: (res: string) => {
          const first = res.trim().split('\n')[0].toUpperCase();
          const isCorrect = first.includes('CORRECT') && !first.includes('INCORRECT');
          this.markAnswered(q, answer, isCorrect, res.trim());
          this.evaluating.set(false);
        },
        error: () => {
          this.markAnswered(q, answer, false, 'Could not evaluate answer.');
          this.evaluating.set(false);
        },
      });
    }
  }

  private markAnswered(q: Question, userAnswer: string, correct: boolean, explanationOverride?: string): void {
    const updatedQ: Question = {
      ...q,
      userAnswer,
      answered: true,
      correct,
      explanation: explanationOverride ?? q.explanation,
    };
    const quiz = this.quiz();
    const questions = quiz.questions.map(x => x.id === q.id ? updatedQ : x);
    const completed = quiz.currentIndex >= questions.length - 1 ? false : quiz.completed;
    this.quizChanged.emit({ ...quiz, questions, completed });
    this.justSubmitted.set(true);
  }

  next(): void {
    const quiz = this.quiz();
    if (quiz.currentIndex < quiz.questions.length - 1) {
      this.quizChanged.emit({ ...quiz, currentIndex: quiz.currentIndex + 1 });
      this.selectedKey.set(null);
      this.freeAnswer.set('');
      this.justSubmitted.set(false);
    } else {
      this.quizChanged.emit({ ...quiz, completed: true });
    }
  }

  restart(): void {
    const quiz = this.quiz();
    const reset = quiz.questions.map(q => ({ ...q, answered: false, correct: undefined, userAnswer: undefined }));
    this.quizChanged.emit({ ...quiz, questions: reset, currentIndex: 0, completed: false });
    this.selectedKey.set(null);
    this.freeAnswer.set('');
    this.justSubmitted.set(false);
  }

  onRetake(): void { this.retake.emit(); }
  onHarder(): void { this.harder.emit(); }

  isChoiceSelected(q: Question, key: string): boolean {
    if (q.answered) return q.userAnswer === key;
    return this.selectedKey() === key;
  }

  choiceClass(q: Question, key: string): string {
    const isSelected = this.isChoiceSelected(q, key);
    const isCorrect = q.answered && q.correctKey != null && key.toUpperCase() === q.correctKey.toUpperCase();
    const isWrongPick = q.answered && isSelected && !isCorrect;
    if (isCorrect) return 'border-accent-500 bg-accent-400/10';
    if (isWrongPick) return 'border-danger-500 bg-danger-500/5';
    if (isSelected && !q.answered) return 'border-primary-500 bg-primary-50';
    if (q.answered) return 'border-border cursor-not-allowed';
    return 'border-border hover:border-primary-300 hover:bg-bg';
  }

  choiceBadgeClass(q: Question, key: string): string {
    const isSelected = this.isChoiceSelected(q, key);
    const isCorrect = q.answered && q.correctKey != null && key.toUpperCase() === q.correctKey.toUpperCase();
    const isWrongPick = q.answered && isSelected && !isCorrect;
    if (isCorrect) return 'bg-accent-500 text-white';
    if (isWrongPick) return 'bg-danger-500 text-white';
    if (isSelected && !q.answered) return 'bg-primary-600 text-white';
    return 'bg-bg text-ink';
  }

  dotClass(qq: Question, i: number): string {
    if (qq.answered && qq.correct) return 'bg-accent-500';
    if (qq.answered && qq.correct === false) return 'bg-danger-500';
    const quiz = this.quiz();
    if (!qq.answered && i === quiz.currentIndex && !quiz.completed) return 'bg-primary-400';
    return 'bg-border';
  }

  copyAsMarkdown(): void {
    const lines: string[] = ['## Quiz Results', '', `Score: ${this.score()} / ${this.total()} (${this.percentage()}%)`, ''];
    this.quiz().questions.forEach((q, i) => {
      lines.push(`### ${i + 1}. ${q.stem}`);
      if (q.choices) {
        q.choices.forEach(c => lines.push(`- ${c.key}) ${c.text}`));
      }
      lines.push(`**Your answer:** ${q.userAnswer ?? '—'}`);
      if (q.correctKey) lines.push(`**Correct answer:** ${q.correctKey}`);
      if (q.explanation) lines.push(`**Explanation:** ${q.explanation}`);
      lines.push('');
    });
    navigator.clipboard.writeText(lines.join('\n')).catch(() => { /* ignore */ });
  }
}
