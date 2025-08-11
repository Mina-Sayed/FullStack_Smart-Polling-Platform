export type QuestionType = "single" | "multiple" | "text";

export interface ConditionalLogic {
  dependsOnQuestionId?: string;
  expectedAnswer?: string;
  operator?: 'equals' | 'contains' | 'not_equals';
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  conditionalLogic?: ConditionalLogic;
  order?: number;
  required?: boolean;
  poll?: Poll;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  allowAnonymous: boolean;
  expiresAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  questions: Question[];
  creator?: User;
  answers?: Answer[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Answer {
  id: string;
  value: string | string[];
  questionId: string;
  userId?: string;
  sessionId?: string;
  createdAt: Date | string;
  question?: Question;
  user?: User;
}

// Legacy types for backward compatibility and local UI state
export interface Option {
  id: string;
  label: string;
}

export interface Condition {
  dependsOnId: string;
  equals?: string;
}

export interface LegacyQuestion {
  id: string;
  title: string;
  type: QuestionType;
  options?: Option[];
  condition?: Condition;
}

export interface LegacyPoll {
  id: string;
  title: string;
  description?: string;
  questions: LegacyQuestion[];
  expiresAt?: string | null;
}

export type AnswerMap = Record<string, string | string[]>;

export interface Submission {
  id: string;
  pollId: string;
  answers: AnswerMap;
  createdAt: string;
  anonymous?: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
