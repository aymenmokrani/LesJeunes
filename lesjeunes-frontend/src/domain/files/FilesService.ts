// domain/files/services/FilesService.ts
import { File, Folder } from './FileEntities.entity';
import { IFilesRepository } from './IFilesRepository';

export class FilesService {
  constructor(private filesRepository: IFilesRepository) {}

  async getFiles(folderId?: number): Promise<File[]> {
    try {
      // Business validation
      if (folderId !== undefined && folderId <= 0) {
        throw new Error('Please select a valid folder');
      }

      return await this.filesRepository.getFiles(folderId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to access this folder');
      }
      if (apiError.status === 404) {
        throw new Error('Folder not found');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      console.log(error);
      throw new Error('Unable to load files. Please try again');
    }
  }

  async getFileById(id: number): Promise<File | null> {
    try {
      if (!id || id <= 0) {
        throw new Error('Please select a valid file');
      }

      return await this.filesRepository.getFileById(id);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to access this file');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to load file. Please try again');
    }
  }

  async updateFile(id: number, name: string): Promise<File> {
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('Please select a valid file');
      }
      if (!name?.trim()) {
        throw new Error('Please enter a file name');
      }
      if (name.trim().length > 255) {
        throw new Error('File name is too long (maximum 255 characters)');
      }

      return await this.filesRepository.updateFile(id, { name: name.trim() });
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to rename this file');
      }
      if (apiError.status === 409) {
        throw new Error('A file with this name already exists');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please')
      ) {
        throw error;
      }

      throw new Error('Unable to rename file. Please try again');
    }
  }

  async deleteFile(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('Please select a valid file');
      }

      await this.filesRepository.deleteFile(id);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to delete this file');
      }
      if (apiError.status === 404) {
        throw new Error('File not found');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to delete file. Please try again');
    }
  }

  async moveFile(id: number, targetFolderId?: number): Promise<File> {
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('Please select a valid file');
      }
      if (targetFolderId !== undefined && targetFolderId <= 0) {
        throw new Error('Please select a valid destination folder');
      }

      return await this.filesRepository.moveFile(id, targetFolderId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to move this file');
      }
      if (apiError.status === 404) {
        throw new Error('File or destination folder not found');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to move file. Please try again');
    }
  }

  async downloadFile(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('Please select a valid file');
      }

      await this.filesRepository.downloadFile(id);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to download this file');
      }
      if (apiError.status === 404) {
        throw new Error('File not found');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to download file. Please try again');
    }
  }

  async searchFiles(query: string, folderId?: number): Promise<File[]> {
    try {
      // Business validation
      if (!query?.trim()) {
        throw new Error('Please enter a search term');
      }
      if (query.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }
      if (folderId !== undefined && folderId <= 0) {
        throw new Error('Please select a valid folder to search in');
      }

      return await this.filesRepository.searchFiles(query.trim(), folderId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to search in this folder');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please')
      ) {
        throw error;
      }

      throw new Error('Search failed. Please try again');
    }
  }

  async createFolder(name: string, parentId?: number): Promise<Folder> {
    try {
      // Business validation
      if (!name?.trim()) {
        throw new Error('Please enter a folder name');
      }
      if (name.trim().length > 255) {
        throw new Error('Folder name is too long (maximum 255 characters)');
      }
      if (parentId !== undefined && parentId <= 0) {
        throw new Error('Please select a valid parent folder');
      }

      return await this.filesRepository.createFolder(name.trim(), parentId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to create folders here');
      }
      if (apiError.status === 409) {
        throw new Error('A folder with this name already exists');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please')
      ) {
        throw error;
      }

      throw new Error('Unable to create folder. Please try again');
    }
  }

  async getFolders(parentId?: number): Promise<Folder[]> {
    try {
      if (parentId !== undefined && parentId <= 0) {
        throw new Error('Please select a valid parent folder');
      }

      return await this.filesRepository.getFolders(parentId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to access this folder');
      }
      if (apiError.status === 404) {
        throw new Error('Parent folder not found');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to load folders. Please try again');
    }
  }

  async getFolderById(id: number): Promise<Folder | null> {
    try {
      if (!id || id <= 0) {
        throw new Error('Please select a valid folder');
      }

      return await this.filesRepository.getFolderById(id);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to access this folder');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to load folder. Please try again');
    }
  }

  async updateFolder(id: number, name: string): Promise<Folder> {
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('Please select a valid folder');
      }
      if (!name?.trim()) {
        throw new Error('Please enter a folder name');
      }
      if (name.trim().length > 255) {
        throw new Error('Folder name is too long (maximum 255 characters)');
      }

      return await this.filesRepository.updateFolder(id, name.trim());
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to rename this folder');
      }
      if (apiError.status === 409) {
        throw new Error('A folder with this name already exists');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please')
      ) {
        throw error;
      }

      throw new Error('Unable to rename folder. Please try again');
    }
  }

  async deleteFolder(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('Please select a valid folder');
      }

      await this.filesRepository.deleteFolder(id);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 403) {
        throw new Error('You do not have permission to delete this folder');
      }
      if (apiError.status === 404) {
        throw new Error('Folder not found');
      }
      if (apiError.status === 409) {
        throw new Error('Cannot delete folder that contains files');
      }
      if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Please select')
      ) {
        throw error;
      }

      throw new Error('Unable to delete folder. Please try again');
    }
  }
}
