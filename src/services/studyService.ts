import { getDb } from '../database/db';
import { SubjectFolder, StudyFile } from '../types';
import { deleteLocalFile } from './fileStorageService';

export async function getFolders(): Promise<SubjectFolder[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    color: string | null;
    created_at: string;
    file_count: number;
  }>(`
    SELECT f.id, f.name, f.color, f.created_at, COUNT(fi.id) AS file_count
    FROM folders f
    LEFT JOIN files fi ON f.id = fi.folder_id
    GROUP BY f.id
    ORDER BY f.name ASC
  `);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color || '#4F46E5',
    createdAt: r.created_at,
    fileCount: r.file_count,
  }));
}

export async function addFolder(name: string, color: string = '#4F46E5'): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    'INSERT INTO folders (name, color, created_at) VALUES (?, ?, ?)',
    name.trim(),
    color,
    now
  );
  return res.lastInsertRowId;
}

export async function updateFolder(id: number, name: string, color?: string): Promise<void> {
  const db = await getDb();
  if (color) {
    await db.runAsync(
      'UPDATE folders SET name = ?, color = ? WHERE id = ?',
      name.trim(),
      color,
      id
    );
  } else {
    await db.runAsync(
      'UPDATE folders SET name = ? WHERE id = ?',
      name.trim(),
      id
    );
  }
}

export async function deleteFolder(id: number): Promise<void> {
  const db = await getDb();
  // Get all files belonging to this folder to delete local storage copies
  const files = await db.getAllAsync<{ file_uri: string }>(
    'SELECT file_uri FROM files WHERE folder_id = ?',
    id
  );
  for (const f of files) {
    await deleteLocalFile(f.file_uri);
  }
  await db.runAsync('DELETE FROM folders WHERE id = ?', id);
}

export async function getFiles(folderId?: number, searchQuery?: string): Promise<StudyFile[]> {
  const db = await getDb();
  let sql = `
    SELECT fi.id, fi.folder_id, fi.file_name, fi.original_name, fi.file_uri,
           fi.file_type, fi.mime_type, fi.file_size, fi.created_at, f.name AS folder_name
    FROM files fi
    JOIN folders f ON fi.folder_id = f.id
  `;
  const params: (number | string)[] = [];
  const conditions: string[] = [];

  if (folderId !== undefined) {
    conditions.push('fi.folder_id = ?');
    params.push(folderId);
  }

  if (searchQuery && searchQuery.trim() !== '') {
    conditions.push('(fi.file_name LIKE ? OR f.name LIKE ?)');
    const query = `%${searchQuery.trim()}%`;
    params.push(query, query);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY fi.created_at DESC';

  const rows = await db.getAllAsync<{
    id: number;
    folder_id: number;
    file_name: string;
    original_name: string;
    file_uri: string;
    file_type: 'pdf' | 'doc' | 'image' | 'other';
    mime_type: string | null;
    file_size: number;
    created_at: string;
    folder_name: string;
  }>(sql, ...params);

  return rows.map((r) => ({
    id: r.id,
    folderId: r.folder_id,
    fileName: r.file_name,
    originalName: r.original_name,
    fileUri: r.file_uri,
    fileType: r.file_type,
    mimeType: r.mime_type || undefined,
    fileSize: r.file_size,
    createdAt: r.created_at,
    folderName: r.folder_name,
  }));
}

export async function addFile(file: {
  folderId: number;
  fileName: string;
  originalName: string;
  fileUri: string;
  fileType: 'pdf' | 'doc' | 'image' | 'other';
  mimeType?: string;
  fileSize?: number;
}): Promise<number> {
  const db = await getDb();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    `INSERT INTO files (folder_id, file_name, original_name, file_uri, file_type, mime_type, file_size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    file.folderId,
    file.fileName.trim(),
    file.originalName,
    file.fileUri,
    file.fileType,
    file.mimeType || null,
    file.fileSize || 0,
    now
  );
  return res.lastInsertRowId;
}

export async function renameFile(id: number, newFileName: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE files SET file_name = ? WHERE id = ?', newFileName.trim(), id);
}

export async function deleteFile(id: number): Promise<void> {
  const db = await getDb();
  const file = await db.getFirstAsync<{ file_uri: string }>(
    'SELECT file_uri FROM files WHERE id = ?',
    id
  );
  if (file) {
    await deleteLocalFile(file.file_uri);
  }
  await db.runAsync('DELETE FROM files WHERE id = ?', id);
}
