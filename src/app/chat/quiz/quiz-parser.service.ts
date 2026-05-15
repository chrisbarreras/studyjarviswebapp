import { Injectable } from '@angular/core';
import { Choice, Question, Quiz, QuizKind } from '../../core/models';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable({ providedIn: 'root' })
export class QuizParserService {
  parse(markdown: string): Quiz | null {
    const text = (markdown ?? '').replace(/\r\n/g, '\n');
    if (!text.trim()) return null;

    const [questionsBlock, answersBlock] = this.splitQuestionsAnswers(text);
    const questionBlocks = this.extractQuestionBlocks(questionsBlock);
    if (questionBlocks.length === 0) return null;

    const answers = this.extractAnswers(answersBlock);

    const questions: Question[] = questionBlocks.map((block, idx) => {
      const stem = this.extractStem(block);
      const choices = this.extractChoices(block);
      const ans = answers[idx + 1];
      return {
        id: uid('q'),
        stem,
        choices: choices.length >= 2 ? choices : undefined,
        correctKey: ans?.key,
        explanation: ans?.explanation,
      };
    });

    const withChoices = questions.filter(q => q.choices && q.choices.length >= 2).length;
    const kind: QuizKind = withChoices >= Math.ceil(questions.length / 2) ? 'multiple-choice' : 'short-answer';

    if (kind === 'multiple-choice') {
      const confidence = withChoices / questions.length;
      if (confidence < 0.5) return null;
    }

    return {
      id: uid('quiz'),
      kind,
      questions,
      sourceMarkdown: text,
      currentIndex: 0,
      completed: false,
    };
  }

  private splitQuestionsAnswers(text: string): [string, string] {
    const ansRe = /^\s{0,3}#{1,6}\s*answers?\s*:?\s*$/im;
    const m = text.match(ansRe);
    if (m && m.index != null) {
      return [text.slice(0, m.index), text.slice(m.index + m[0].length)];
    }
    const altRe = /\n\s*\*\*\s*answers?\s*[:\*]{1,2}\s*\n/i;
    const alt = text.match(altRe);
    if (alt && alt.index != null) {
      return [text.slice(0, alt.index), text.slice(alt.index + alt[0].length)];
    }
    const plainRe = /^[ \t]{0,3}answers?[ \t]*:[ \t]*$/im;
    const plain = text.match(plainRe);
    if (plain && plain.index != null) {
      return [text.slice(0, plain.index), text.slice(plain.index + plain[0].length)];
    }
    return [text, ''];
  }

  private extractQuestionBlocks(text: string): string[] {
    const lines = text.split('\n');
    const blocks: string[][] = [];
    let current: string[] | null = null;
    const startRe = /^\s*(\d+)[\.\)]\s+/;
    for (const line of lines) {
      if (startRe.test(line)) {
        if (current) blocks.push(current);
        current = [line];
      } else if (current) {
        current.push(line);
      }
    }
    if (current) blocks.push(current);
    return blocks.map(b => b.join('\n').trim()).filter(Boolean);
  }

  private extractStem(block: string): string {
    const firstLineMatch = block.match(/^\s*\d+[\.\)]\s+(.*)$/m);
    let stem = firstLineMatch ? firstLineMatch[1].trim() : block.split('\n')[0].trim();
    stem = stem.replace(/^\*\*(.*)\*\*$/s, '$1').trim();
    stem = stem.replace(/\*\*/g, '').trim();
    return stem;
  }

  private extractChoices(block: string): Choice[] {
    const choiceRe = /^\s*[\(\[]?([A-Ha-h])[\)\]\.\:]\s+(.+)$/gm;
    const choices: Choice[] = [];
    let m: RegExpExecArray | null;
    while ((m = choiceRe.exec(block)) !== null) {
      choices.push({ key: m[1].toUpperCase(), text: m[2].trim() });
    }
    const unique = new Map<string, Choice>();
    for (const c of choices) {
      if (!unique.has(c.key)) unique.set(c.key, c);
    }
    return Array.from(unique.values());
  }

  private extractAnswers(text: string): Record<number, { key?: string; explanation?: string }> {
    const out: Record<number, { key?: string; explanation?: string }> = {};
    if (!text.trim()) return out;
    const lineRe = /^\s*(\d+)[\.\)]\s+(.*)$/gm;
    let m: RegExpExecArray | null;
    while ((m = lineRe.exec(text)) !== null) {
      const idx = Number(m[1]);
      const rest = m[2].trim();
      const keyMatch = rest.match(/^[\(\[]?([A-Ha-h])[\)\]\.\:]?\b\s*(.*)$/);
      if (keyMatch) {
        out[idx] = {
          key: keyMatch[1].toUpperCase(),
          explanation: keyMatch[2].replace(/^[—–-]\s*/, '').trim() || undefined,
        };
      } else {
        out[idx] = { explanation: rest };
      }
    }
    return out;
  }
}
