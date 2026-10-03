import { getDb } from '../database/db';
import { Note, Task } from '../types';

// ================= NOTES =================

export async function getNotes(): Promise<Note[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM notes ORDER BY updated_at DESC, id DESC');

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function addNote(title: string, content: string): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const safeTitle = title.trim() || content.trim().slice(0, 30) || 'Untitled Note';
  const res = await db.runAsync(
    'INSERT INTO notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)',
    safeTitle,
    content.trim(),
    now,
    now
  );
  return res.lastInsertRowId;
}

export async function updateNote(id: number, title: string, content: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const safeTitle = title.trim() || content.trim().slice(0, 30) || 'Untitled Note';
  await db.runAsync(
    'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?',
    safeTitle,
    content.trim(),
    now,
    id
  );
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}

// ================= TASKS =================

export async function getTasks(filter: 'all' | 'pending' | 'completed' = 'all'): Promise<Task[]> {
  const db = await getDb();
  let sql = 'SELECT * FROM tasks';
  const params: number[] = [];

  if (filter === 'pending') {
    sql += ' WHERE is_completed = 0';
  } else if (filter === 'completed') {
    sql += ' WHERE is_completed = 1';
  }

  sql += ' ORDER BY is_completed ASC, id DESC';

  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    is_completed: number;
    due_date: string | null;
    priority: 'low' | 'medium' | 'high' | null;
    created_at: string;
  }>(sql, ...params);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    isCompleted: r.is_completed === 1,
    dueDate: r.due_date || undefined,
    priority: r.priority || 'medium',
    createdAt: r.created_at,
  }));
}

export async function addTask(
  title: string,
  dueDate?: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    'INSERT INTO tasks (title, is_completed, due_date, priority, created_at) VALUES (?, 0, ?, ?, ?)',
    title.trim(),
    dueDate || null,
    priority,
    now
  );
  return res.lastInsertRowId;
}

export async function updateTask(
  id: number,
  title: string,
  dueDate?: string,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE tasks SET title = ?, due_date = ?, priority = ? WHERE id = ?',
    title.trim(),
    dueDate || null,
    priority,
    id
  );
}

export async function toggleTask(id: number, isCompleted: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE tasks SET is_completed = ? WHERE id = ?', isCompleted ? 1 : 0, id);
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function getPendingTaskCount(): Promise<number> {
  const db = await getDb();
  const res = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tasks WHERE is_completed = 0'
  );
  return res ? res.count : 0;
}
