import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync('student_helper.db');
  await initDatabase(dbInstance);
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TABLES_SQL);
  await seedInitialDataIfNeeded(db);
}

async function seedInitialDataIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const initialized = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    'db_initialized'
  );

  if (initialized) {
    return;
  }

  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // Seed default folders matching the prompt
  const folders = [
    { name: 'Database Systems', color: '#4F46E5' },
    { name: 'Algorithms', color: '#0284C7' },
    { name: 'Machine Learning', color: '#10B981' },
    { name: 'Programming', color: '#8B5CF6' },
  ];

  for (const f of folders) {
    await db.runAsync(
      'INSERT OR IGNORE INTO folders (name, color, created_at) VALUES (?, ?, ?)',
      f.name,
      f.color,
      now
    );
  }

  // Seed sample classes
  await db.runAsync(
    `INSERT INTO classes (subject, teacher, room, day, start_time, end_time, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'Database Systems',
    'Dr. Smith',
    'Room 204',
    'Monday',
    '09:00',
    '10:30',
    '#4F46E5'
  );

  await db.runAsync(
    `INSERT INTO classes (subject, teacher, room, day, start_time, end_time, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'Algorithms',
    'Prof. Alan',
    'Lab 2',
    'Monday',
    '11:00',
    '12:30',
    '#0284C7'
  );

  await db.runAsync(
    `INSERT INTO classes (subject, teacher, room, day, start_time, end_time, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'Machine Learning',
    'Dr. Brenda',
    'Room 301',
    'Tuesday',
    '10:00',
    '11:30',
    '#10B981'
  );

  await db.runAsync(
    `INSERT INTO classes (subject, teacher, room, day, start_time, end_time, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'Programming',
    'Prof. Alan',
    'Lab 1',
    'Wednesday',
    '14:00',
    '16:00',
    '#8B5CF6'
  );

  // Seed prompt sample note: "Sir said the midterm covers chapters 1–4."
  await db.runAsync(
    'INSERT INTO notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)',
    'Midterm Exam Scope',
    'Sir said the midterm covers chapters 1–4.',
    now,
    now
  );

  // Seed prompt sample tasks
  await db.runAsync(
    'INSERT INTO tasks (title, is_completed, priority, created_at) VALUES (?, ?, ?, ?)',
    'Submit DB assignment',
    0,
    'high',
    now
  );

  await db.runAsync(
    'INSERT INTO tasks (title, is_completed, priority, created_at) VALUES (?, ?, ?, ?)',
    'Print ML report',
    0,
    'medium',
    now
  );

  await db.runAsync(
    'INSERT INTO tasks (title, is_completed, priority, created_at) VALUES (?, ?, ?, ?)',
    'Submit programming assignment',
    1,
    'low',
    now
  );

  // Seed prompt sample expenses: Rs. 250 today
  await db.runAsync(
    'INSERT INTO expenses (amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?)',
    250,
    'Food',
    'Cafeteria lunch & coffee',
    today,
    now
  );

  await db.runAsync(
    'INSERT INTO expenses (amount, category, description, date, created_at) VALUES (?, ?, ?, ?, ?)',
    120,
    'Printing',
    'Algorithms assignment printouts',
    today,
    now
  );

  // Settings
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'monthly_budget',
    '15000'
  );

  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'currency_symbol',
    'Rs.'
  );

  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    'db_initialized',
    '1'
  );
}
