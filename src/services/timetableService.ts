import { getDb } from '../database/db';
import { TimetableClass, DayOfWeek, DAYS_OF_WEEK } from '../types';

export async function getClassesByDay(day: DayOfWeek): Promise<TimetableClass[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    subject: string;
    teacher: string;
    room: string;
    day: DayOfWeek;
    start_time: string;
    end_time: string;
    color: string | null;
  }>(
    'SELECT * FROM classes WHERE day = ? ORDER BY start_time ASC',
    day
  );

  return rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    teacher: r.teacher,
    room: r.room,
    day: r.day,
    startTime: r.start_time,
    endTime: r.end_time,
    color: r.color || '#4F46E5',
  }));
}

export async function getAllClasses(): Promise<TimetableClass[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    subject: string;
    teacher: string;
    room: string;
    day: DayOfWeek;
    start_time: string;
    end_time: string;
    color: string | null;
  }>('SELECT * FROM classes ORDER BY day, start_time ASC');

  return rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    teacher: r.teacher,
    room: r.room,
    day: r.day,
    startTime: r.start_time,
    endTime: r.end_time,
    color: r.color || '#4F46E5',
  }));
}

export async function addClass(cls: Omit<TimetableClass, 'id'>): Promise<number> {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO classes (subject, teacher, room, day, start_time, end_time, color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    cls.subject.trim(),
    cls.teacher.trim(),
    cls.room.trim(),
    cls.day,
    cls.startTime.trim(),
    cls.endTime.trim(),
    cls.color || '#4F46E5'
  );
  return res.lastInsertRowId;
}

export async function updateClass(id: number, cls: Omit<TimetableClass, 'id'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE classes 
     SET subject = ?, teacher = ?, room = ?, day = ?, start_time = ?, end_time = ?, color = ?
     WHERE id = ?`,
    cls.subject.trim(),
    cls.teacher.trim(),
    cls.room.trim(),
    cls.day,
    cls.startTime.trim(),
    cls.endTime.trim(),
    cls.color || '#4F46E5',
    id
  );
}

export async function deleteClass(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM classes WHERE id = ?', id);
}

export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
  const mapping: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return mapping[dayIndex];
}

export function formatTime24to12(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export async function getNextUpcomingClass(): Promise<{
  cls: TimetableClass;
  isToday: boolean;
  day: DayOfWeek;
} | null> {
  const today = getCurrentDayOfWeek();
  const todayClasses = await getClassesByDay(today);

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeVal = currentHours * 60 + currentMinutes;

  function timeToMinutes(timeStr: string): number {
    const clean = timeStr.trim();
    const isPM = clean.toUpperCase().includes('PM');
    const isAM = clean.toUpperCase().includes('AM');
    const numPart = clean.replace(/[^\d:]/g, '');
    const [hStr, mStr] = numPart.split(':');
    let h = parseInt(hStr || '0', 10);
    const m = parseInt(mStr || '0', 10);
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return h * 60 + m;
  }

  // Find class starting after or ending after current time today
  for (const c of todayClasses) {
    const endMinutes = timeToMinutes(c.endTime);
    if (endMinutes > currentTimeVal) {
      return { cls: c, isToday: true, day: today };
    }
  }

  // If no more classes today, look for the next upcoming day's classes
  const todayIdx = DAYS_OF_WEEK.indexOf(today);
  for (let i = 1; i <= 6; i++) {
    const nextDayIdx = (todayIdx + i) % 7;
    const nextDay = DAYS_OF_WEEK[nextDayIdx];
    const nextDayClasses = await getClassesByDay(nextDay);
    if (nextDayClasses.length > 0) {
      return { cls: nextDayClasses[0], isToday: false, day: nextDay };
    }
  }

  return null;
}
