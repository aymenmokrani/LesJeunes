// domain/files/repositories/IFilesRepository.ts
import { File, Folder } from './FileEntities.entity';

export interface IFilesRepository {
  // File operations
  getFiles(folderId?: number): Promise<File[]>;
  getFileById(id: number): Promise<File | null>;
  updateFile(id: number, data: Partial<File>): Promise<File>;
  deleteFile(id: number): Promise<void>;
  moveFile(id: number, targetFolderId?: number): Promise<File>;
  downloadFile(id: number): Promise<void>;
  searchFiles(query: string, folderId?: number): Promise<File[]>;

  // Folder operations
  createFolder(name: string, parentId?: number): Promise<Folder>;
  getFolders(parentId?: number): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | null>;
  updateFolder(id: number, name: string): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;
}
