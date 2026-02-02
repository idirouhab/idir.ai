// Type definitions for Automation Knowledge Test

export type QuestionType = 'yes_no' | 'multiple_choice' | 'text' | 'code';

export interface BaseQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  points: number;
  question: string;
}

export interface YesNoQuestion extends BaseQuestion {
  type: 'yes_no';
  options: { id: string; label: string }[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: { id: string; label: string }[];
  contextData?: any; // Optional JSON context to display before options
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  placeholder: string;
  minLength: number;
  maxLength: number;
  evaluationCriteria: string[];
}

export interface CodeQuestion extends BaseQuestion {
  type: 'code';
  inputExample?: any; // Optional
  expectedOutput?: any; // Optional
  languages: {
    id: string;
    label?: string; // Optional
    template: string;
  }[];
  evaluationCriteria?: string[]; // Optional
}

export type Question = YesNoQuestion | MultipleChoiceQuestion | TextQuestion | CodeQuestion;

export interface Section {
  id: string;
  title: string;
  difficulty: string;
  description: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  totalPoints: number;
  version: string;
}

export interface ScoringLevel {
  id: string;
  label: string;
  minScore: number;
  maxScore: number;
  coursePath: string;
  description: string;
}

export interface TestData {
  assessment: Assessment;
  sections: Section[];
  questions: Question[];
  scoring: {
    levels: ScoringLevel[];
  };
}

export interface TestResults {
  score: number;
  maxScore: number;
  percentage: number;
  level: ScoringLevel;
  breakdown: {
    sectionId: string;
    sectionTitle: string;
    score: number;
    maxScore: number;
  }[];
}

export interface AnswerSubmission {
  questionId: string;
  answer: any;
}

export interface FeedbackResponse {
  correct: boolean;
  explanation: string;
  pointsEarned: number;
}
