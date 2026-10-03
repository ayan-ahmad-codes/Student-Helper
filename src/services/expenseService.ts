import { getDb } from '../database/db';
import { Expense, ExpenseCategory, ExpenseSummary, BudgetConfig, EXPENSE_CATEGORIES } from '../types';

export async function getExpenses(): Promise<Expense[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    created_at: string;
  }>('SELECT * FROM expenses ORDER BY date DESC, id DESC');

  return rows.map((r) => ({
    id: r.id,
    amount: r.amount,
    category: r.category,
    description: r.description,
    date: r.date,
    createdAt: r.created_at,
  }));
}

export async function addExpense(expense: {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    'INSERT INTO expenses (amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?)',
    expense.amount,
    expense.category,
    expense.description.trim(),
    expense.date,
    now
  );
  return res.lastInsertRowId;
}

export async function updateExpense(
  id: number,
  expense: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
  }
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE expenses SET amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
    expense.amount,
    expense.category,
    expense.description.trim(),
    expense.date,
    id
  );
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}

export async function getBudgetConfig(): Promise<BudgetConfig> {
  const db = await getDb();
  const budgetRow = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    'monthly_budget'
  );
  const symbolRow = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    'currency_symbol'
  );

  return {
    monthlyBudget: budgetRow ? parseFloat(budgetRow.value) || 0 : 0,
    currencySymbol: symbolRow ? symbolRow.value : 'Rs.',
  };
}

export async function setMonthlyBudget(budget: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'monthly_budget',
    budget.toString()
  );
}

export async function setCurrencySymbol(symbol: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'currency_symbol',
    symbol
  );
}

export async function getExpenseSummary(): Promise<ExpenseSummary> {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  const currentYearMonth = today.slice(0, 7); // 'YYYY-MM'

  // Today spending
  const todayRow = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) AS total FROM expenses WHERE date = ?',
    today
  );
  const todaySpending = todayRow?.total || 0;

  // Monthly spending
  const monthRow = await db.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) AS total FROM expenses WHERE date LIKE ? || '%'",
    currentYearMonth
  );
  const monthlySpending = monthRow?.total || 0;

  // Total spending
  const totalRow = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) AS total FROM expenses'
  );
  const totalSpending = totalRow?.total || 0;

  // Category totals for current month
  const categoryRows = await db.getAllAsync<{ category: ExpenseCategory; total: number }>(
    "SELECT category, SUM(amount) AS total FROM expenses WHERE date LIKE ? || '%' GROUP BY category",
    currentYearMonth
  );

  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Transport: 0,
    University: 0,
    Printing: 0,
    Shopping: 0,
    Other: 0,
  };

  categoryRows.forEach((row) => {
    if (EXPENSE_CATEGORIES.includes(row.category)) {
      categoryTotals[row.category] = row.total;
    }
  });

  const budgetConfig = await getBudgetConfig();
  const remainingBudget = Math.max(0, budgetConfig.monthlyBudget - monthlySpending);

  return {
    todaySpending,
    monthlySpending,
    totalSpending,
    categoryTotals,
    monthlyBudget: budgetConfig.monthlyBudget,
    remainingBudget,
    currencySymbol: budgetConfig.currencySymbol,
  };
}
