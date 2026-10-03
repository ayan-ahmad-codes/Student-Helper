import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { FileType } from '../types';

const MATERIALS_DIR = `${FileSystem.documentDirectory}study_materials/`;

// Ensure local study_materials directory exists
export async function ensureMaterialsDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MATERIALS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MATERIALS_DIR, { intermediates: true });
  }
}

export function detectFileType(fileName: string, mimeType?: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return 'pdf';
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx'].includes(ext) || mimeType?.includes('word') || mimeType?.includes('officedocument')) {
    return 'doc';
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic'].includes(ext) || mimeType?.includes('image')) {
    return 'image';
  }
  return 'other';
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function savePhotoToAppStorage(sourceUri: string, baseName?: string): Promise<{ uri: string; size: number }> {
  await ensureMaterialsDir();
  const timestamp = Date.now();
  const cleanName = baseName ? baseName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'photo';
  const targetUri = `${MATERIALS_DIR}${cleanName}_${timestamp}.jpg`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: targetUri,
  });

  const fileInfo = await FileSystem.getInfoAsync(targetUri);
  const size = fileInfo.exists && 'size' in fileInfo ? (fileInfo.size || 0) : 0;
  return { uri: targetUri, size };
}

export async function saveImportedFileToAppStorage(sourceUri: string, originalName: string): Promise<{ uri: string; size: number }> {
  await ensureMaterialsDir();
  const timestamp = Date.now();
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
  const targetUri = `${MATERIALS_DIR}${cleanName}_${timestamp}${ext ? '.' + ext : ''}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri,
    });
    const fileInfo = await FileSystem.getInfoAsync(targetUri);
    const size = fileInfo.exists && 'size' in fileInfo ? (fileInfo.size || 0) : 0;
    return { uri: targetUri, size };
  } catch {
    // If copying fails (e.g. content URI restriction), return sourceUri
    const fileInfo = await FileSystem.getInfoAsync(sourceUri).catch(() => null);
    const size = fileInfo && fileInfo.exists && 'size' in fileInfo ? (fileInfo.size || 0) : 0;
    return { uri: sourceUri, size };
  }
}

export async function openFileWithDevice(fileUri: string, mimeType?: string, fileName?: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: mimeType || undefined,
        dialogTitle: fileName ? `Open ${fileName}` : 'Open file',
        UTI: mimeType || undefined,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Error opening file with device:', error);
    return false;
  }
}

export async function deleteLocalFile(fileUri: string): Promise<void> {
  try {
    if (fileUri.startsWith(MATERIALS_DIR)) {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    }
  } catch (err) {
    console.warn('Could not delete physical file:', err);
  }
}
