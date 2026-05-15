import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuizCardComponent } from './quiz-card.component';
import { Quiz, Question } from '../../core/models';

function makeQuiz(): Quiz {
  const q1: Question = { id: 'q1', stem: 'Q1?', choices: [{ key: 'A', text: 'one' }, { key: 'B', text: 'two' }], correctKey: 'A' };
  const q2: Question = { id: 'q2', stem: 'Q2?', choices: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], correctKey: 'B' };
  return { id: 'qz', kind: 'multiple-choice', questions: [q1, q2], sourceMarkdown: '', currentIndex: 0, completed: false };
}

describe('QuizCardComponent', () => {
  let component: QuizCardComponent;
  let componentRef: ComponentRef<QuizCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizCardComponent, HttpClientTestingModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(QuizCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('quiz', makeQuiz());
  });

  it('creates and exposes computed score/percentage', () => {
    expect(component).toBeTruthy();
    expect(component.total()).toBe(2);
    expect(component.score()).toBe(0);
    expect(component.percentage()).toBe(0);
  });

  it('selectChoice updates selectedKey', () => {
    component.selectChoice('B');
    expect(component.selectedKey()).toBe('B');
  });

  it('submit emits a quizChanged with the answered question marked correct/incorrect', () => {
    let emitted: Quiz | undefined;
    component.quizChanged.subscribe(q => { emitted = q; });
    component.selectChoice('A');
    component.submit();
    expect(emitted).toBeTruthy();
    expect(emitted!.questions[0].answered).toBeTrue();
    expect(emitted!.questions[0].correct).toBeTrue();
  });

  it('next advances currentIndex', () => {
    let emitted: Quiz | undefined;
    component.quizChanged.subscribe(q => { emitted = q; });
    component.next();
    expect(emitted!.currentIndex).toBe(1);
  });

  it('next on the last question marks the quiz completed', () => {
    componentRef.setInput('quiz', { ...component.quiz(), currentIndex: 1 });
    let emitted: Quiz | undefined;
    component.quizChanged.subscribe(q => { emitted = q; });
    component.next();
    expect(emitted!.completed).toBeTrue();
  });

  it('restart resets answers and currentIndex', () => {
    const answered = makeQuiz();
    answered.questions[0].answered = true;
    answered.questions[0].correct = true;
    answered.currentIndex = 1;
    componentRef.setInput('quiz', answered);
    let emitted: Quiz | undefined;
    component.quizChanged.subscribe(q => { emitted = q; });
    component.restart();
    expect(emitted!.currentIndex).toBe(0);
    expect(emitted!.completed).toBeFalse();
    expect(emitted!.questions[0].answered).toBeFalse();
    expect(emitted!.questions[0].correct).toBeUndefined();
  });

  // Regression for the "Submit doesn't advance / show feedback" bug.
  // Before the fix, `quiz` was an `@Input()` plain property and the component
  // read it from inside `computed()` signals. Computed only tracks signal
  // reads, so a new quiz object handed in by the parent never invalidated the
  // cached `current()`/`total()`/etc. After converting to `input.required()`,
  // the computeds re-evaluate when the input signal updates.
  it('current() reflects updates to the quiz input', () => {
    const initial = makeQuiz();
    componentRef.setInput('quiz', initial);
    expect(component.current()?.answered).toBeFalsy();

    const updated: Quiz = {
      ...initial,
      questions: initial.questions.map((q, i) =>
        i === 0 ? { ...q, answered: true, correct: true, userAnswer: 'A' } : q
      ),
    };
    componentRef.setInput('quiz', updated);

    expect(component.current()?.answered)
      .withContext('current() must re-evaluate after the quiz input changes')
      .toBeTrue();
  });

  it('choiceClass returns selected/unselected/correct/wrong variants', () => {
    const q = component.quiz().questions[0]; // correctKey = 'A'
    component.selectedKey.set('A');
    expect(component.choiceClass(q, 'A')).toContain('border-primary-500');

    const answeredCorrect = { ...q, answered: true, correct: true, userAnswer: 'A' };
    expect(component.choiceClass(answeredCorrect, 'A')).toContain('border-accent-500');

    // Wrong pick: user picked B but correct is A. Test the class for B (the wrong choice).
    const answeredWrong = { ...q, answered: true, correct: false, userAnswer: 'B' };
    expect(component.choiceClass(answeredWrong, 'B')).toContain('border-danger-500');
  });
});
