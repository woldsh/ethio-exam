export interface Question {
    id: string;
    subjectId: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option (0-3)
    explanation?: string;
    section: 'natural' | 'social' | 'freshman';
    type: 'mcq' | 'theory';
    year?: string;
    createdAt: Date;
}

export interface Subject {
    id: string;
    name: string;
    icon: string;
    description: string;
    questionCount: number;
    color: string;
    sections?: string[]; // Array of 'natural', 'social', 'freshman'
    duration?: number; // Exam duration in minutes
}

export interface UserProgress {
    id: string;
    userId: string;
    questionId: string;
    subjectId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    answeredAt: Date;
}

export interface ExamSession {
    subjectId: string;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, number>;
    startedAt: Date;
}
