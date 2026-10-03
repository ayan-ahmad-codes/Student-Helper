export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface SubjectFolder {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  fileCount?: number;
}

export type FileType = 'pdf' | 'doc' | 'image' | 'other';

export interface StudyFile {
  id: number;
  folderId: number;
  fileName: string;
  originalName: string;
  fileUri: string;
  fileType: FileType;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
  folderName?: string;
}

export interface TimetableClass {
  id: number;
  subject: string;
  teacher: string;
  room: string;
  day: DayOfWeek;
  startTime: string; // HH:mm or HH:mm AM/PM
  endTime: string;   // HH:mm or HH:mm AM/PM
  color?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
}

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'University'
  | 'Printing'
  | 'Shopping'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'University',
  'Printing',
  'Shopping',
  'Other',
];

export interface Expense {
  id: number;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ExpenseSummary {
  todaySpending: number;
  monthlySpending: number;
  totalSpending: number;
  categoryTotals: Record<ExpenseCategory, number>;
  monthlyBudget: number;
  remainingBudget: number;
  currencySymbol: string;
}

export interface BudgetConfig {
  monthlyBudget: number;
  currencySymbol: string;
}
