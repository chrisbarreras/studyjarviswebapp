import { TestBed } from '@angular/core/testing';
import { QuizParserService } from './quiz-parser.service';

describe('QuizParserService', () => {
  let service: QuizParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizParserService);
  });

  it('returns null for empty input', () => {
    expect(service.parse('')).toBeNull();
    expect(service.parse('   ')).toBeNull();
    expect(service.parse(null as unknown as string)).toBeNull();
  });

  it('returns null when no questions can be parsed', () => {
    expect(service.parse('Hello world. Nothing here.')).toBeNull();
  });

  it('parses a typical multiple-choice quiz with answers section', () => {
    const md = `## Questions:
1. What is the derivative of x²?
   A) x
   B) 2x
   C) x²
   D) 2

2. What is sin(0)?
   A) 1
   B) 0
   C) -1
   D) undefined

## Answers:
1. B) 2x — power rule.
2. B) 0 — sine of zero is zero.`;

    const quiz = service.parse(md)!;
    expect(quiz).not.toBeNull();
    expect(quiz.kind).toBe('multiple-choice');
    expect(quiz.questions.length).toBe(2);

    const [q1, q2] = quiz.questions;
    expect(q1.stem.toLowerCase()).toContain('derivative of x');
    expect(q1.choices?.length).toBe(4);
    expect(q1.choices?.[1]).toEqual({ key: 'B', text: '2x' });
    expect(q1.correctKey).toBe('B');
    expect(q1.explanation).toContain('power rule');

    expect(q2.stem).toContain('sin(0)');
    expect(q2.correctKey).toBe('B');
  });

  it('strips bold markers from question stems', () => {
    const md = `## Questions:
1. **What is 2 + 2?**
   A) 3
   B) 4
   C) 5

## Answers:
1. B) 4`;

    const quiz = service.parse(md)!;
    expect(quiz.questions[0].stem).toBe('What is 2 + 2?');
  });

  it('detects short-answer when no choices are present', () => {
    const md = `## Questions:
1. Define photosynthesis.
2. Name the powerhouse of the cell.

## Answers:
1. The process by which plants convert light into chemical energy.
2. Mitochondria.`;

    const quiz = service.parse(md)!;
    expect(quiz.kind).toBe('short-answer');
    expect(quiz.questions.length).toBe(2);
    expect(quiz.questions[0].choices).toBeUndefined();
    expect(quiz.questions[0].explanation).toContain('plants convert light');
  });

  it('falls back to short-answer when most questions lack choices', () => {
    const md = `## Questions:
1. What is X?
   A) one
   B) two
2. What is Y?
3. What is Z?
4. What is W?
## Answers:
1. A
2. y
3. z
4. w`;
    const quiz = service.parse(md)!;
    expect(quiz).not.toBeNull();
    expect(quiz.kind).toBe('short-answer');
    expect(quiz.questions.length).toBe(4);
  });

  it('handles "Answer:" header (singular) and varied bullet styles', () => {
    const md = `## Questions
1) First question?
   (A) alpha
   (B) beta
   (C) gamma
2) Second question?
   a. red
   b. green
   c. blue

## Answer
1) (B) beta — explanation one.
2) b. green — explanation two.`;

    const quiz = service.parse(md)!;
    expect(quiz.kind).toBe('multiple-choice');
    expect(quiz.questions.length).toBe(2);
    expect(quiz.questions[0].correctKey).toBe('B');
    expect(quiz.questions[1].correctKey).toBe('B');
  });

  it('initializes currentIndex to 0 and completed to false', () => {
    const md = `## Questions:
1. Q1
   A) one
   B) two
## Answers:
1. A`;
    const quiz = service.parse(md)!;
    expect(quiz.currentIndex).toBe(0);
    expect(quiz.completed).toBe(false);
  });

  it('preserves the source markdown', () => {
    const md = `## Questions:
1. Q1
   A) one
   B) two
## Answers:
1. A`;
    const quiz = service.parse(md)!;
    expect(quiz.sourceMarkdown).toBe(md);
  });

  it('produces unique IDs for each question and the quiz itself', () => {
    const md = `## Questions:
1. Q1
   A) a
   B) b
2. Q2
   A) a
   B) b
## Answers:
1. A
2. B`;
    const quiz = service.parse(md)!;
    expect(quiz.id).toBeTruthy();
    expect(quiz.questions[0].id).not.toBe(quiz.questions[1].id);
  });

  it('deduplicates choice keys if the LLM repeats them', () => {
    const md = `## Questions:
1. Q1
   A) original
   A) duplicate
   B) other

## Answers:
1. A`;
    const quiz = service.parse(md)!;
    expect(quiz.questions[0].choices?.length).toBe(2);
    expect(quiz.questions[0].choices?.[0]).toEqual({ key: 'A', text: 'original' });
  });

  // Regression for the "asked for 5, got 10" bug. When Gemini produces an
  // answers section that is just a plain "Answers:" line — neither a markdown
  // heading nor a bolded label — the parser fails to split, treats the
  // numbered answer lines as additional questions, and returns 2× the count.
  it('treats plain "Answers:" line as a section divider, not as more questions', () => {
    const md = `1. What is 1+1?
   A) 1
   B) 2
   C) 3
2. What is 2+2?
   A) 3
   B) 4
   C) 5
3. What is 3+3?
   A) 5
   B) 6
   C) 7
4. What is 4+4?
   A) 7
   B) 8
   C) 9
5. What is 5+5?
   A) 9
   B) 10
   C) 11

Answers:
1. B
2. B
3. B
4. B
5. B`;
    const quiz = service.parse(md)!;
    expect(quiz).not.toBeNull();
    expect(quiz.questions.length)
      .withContext('answers section should not be parsed as more questions')
      .toBe(5);
  });

  it('handles missing answers section by leaving correctKey undefined', () => {
    const md = `## Questions:
1. Q1
   A) one
   B) two
2. Q2
   A) three
   B) four`;
    const quiz = service.parse(md)!;
    expect(quiz.questions[0].correctKey).toBeUndefined();
    expect(quiz.questions[1].correctKey).toBeUndefined();
  });
});
