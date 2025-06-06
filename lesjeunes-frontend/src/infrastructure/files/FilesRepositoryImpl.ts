// infrastructure/files/repositories/FilesRepository.ts
import { IFilesRepository } from '@/domain/files/IFilesRepository';
import { filesApiClient } from '@/infrastructure/files/filesApi';
import { Folder, File } from '@/domain/files/FileEntities.entity';

export class FilesRepository implements IFilesRepository {
  async getFiles(folderId?: number): Promise<File[]> {
    // Input validation
    if (folderId !== undefined && folderId < 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    const files = await filesApiClient.getFiles({ folderId });
    // Transform API response to domain entities
    return files.map(
      (dto) =>
        ({
          id: dto.id,
          name: dto.fileName,
          type: 'file',
          size: dto.size,
          mimeType: dto.mimeType,
          modifiedAt: dto.updatedAt,
          createdAt: dto.createdAt,
          parentId: dto.folderId,
        }) as File
    );
  }

  async getFileById(id: number): Promise<File | null> {
    if (!id || id < 0) {
      throw new Error('Invalid file ID: must be a positive number');
    }

    try {
      const dto = await filesApiClient.getFileById(id);

      return {
        id: dto.id,
        name: dto.fileName,
        type: 'file',
        size: dto.size,
        mimeType: dto.mimeType,
        modifiedAt: dto.updatedAt,
        createdAt: dto.createdAt,
        parentId: dto.folderId,
      } as File;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateFile(id: number, data: Partial<File>): Promise<File> {
    if (!id || id < 0) {
      throw new Error('Invalid file ID: must be a positive number');
    }

    const updateData = {
      name: data.name,
      folderId: data.parentId,
    };

    const dto = await filesApiClient.updateFile(id, updateData);

    return {
      id: dto.id,
      name: dto.fileName,
      type: 'file',
      size: dto.size,
      mimeType: dto.mimeType,
      modifiedAt: dto.updatedAt,
      createdAt: dto.createdAt,
      parentId: dto.folderId,
    } as File;
  }

  async deleteFile(id: number): Promise<void> {
    if (!id || id < 0) {
      throw new Error('Invalid file ID: must be a positive number');
    }

    await filesApiClient.deleteFile(id);
  }

  async moveFile(id: number, targetFolderId?: number): Promise<File> {
    if (!id || id < 0) {
      throw new Error('Invalid file ID: must be a positive number');
    }
    if (targetFolderId !== undefined && targetFolderId < 0) {
      throw new Error('Invalid target folder ID: must be a positive number');
    }

    const dto = await filesApiClient.moveFile(id, { folderId: targetFolderId });

    return {
      id: dto.id,
      name: dto.fileName,
      type: 'file',
      size: dto.size,
      mimeType: dto.mimeType,
      modifiedAt: dto.updatedAt,
      createdAt: dto.createdAt,
      parentId: dto.folderId,
    } as File;
  }

  async downloadFile(id: number): Promise<void> {
    if (!id || id < 0) {
      throw new Error('Invalid file ID: must be a positive number');
    }

    await filesApiClient.downloadFile(id);
  }

  async createFolder(name: string, parentId?: number): Promise<Folder> {
    if (!name?.trim()) {
      throw new Error('Folder name is required');
    }
    if (parentId !== undefined && parentId < 0) {
      throw new Error('Invalid parent folder ID: must be a positive number');
    }

    const dto = await filesApiClient.createFolder({
      name: name.trim(),
      parentId,
    });

    return {
      id: dto.id,
      name: dto.name,
      type: 'folder',
      modifiedAt: dto.updatedAt,
      createdAt: dto.createdAt,
      parentId: dto.parentId,
    } as Folder;
  }

  async getFolders(parentId?: number): Promise<Folder[]> {
    if (parentId !== undefined && parentId < 0) {
      throw new Error('Invalid parent folder ID: must be a positive number');
    }

    const dtos = await filesApiClient.getFolders({ parentId });

    return dtos.map(
      (dto) =>
        ({
          id: dto.id,
          name: dto.name,
          type: 'folder',
          modifiedAt: dto.updatedAt,
          createdAt: dto.createdAt,
          parentId: dto.parentId,
        }) as Folder
    );
  }

  async getFolderById(id: number): Promise<Folder | null> {
    if (!id || id < 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    try {
      const dto = await filesApiClient.getFolderById(id);

      return {
        id: dto.id,
        name: dto.name,
        type: 'folder',
        modifiedAt: dto.updatedAt,
        createdAt: dto.createdAt,
        parentId: dto.parentId,
      } as Folder;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateFolder(id: number, name: string): Promise<Folder> {
    if (!id || id < 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }
    if (!name?.trim()) {
      throw new Error('Folder name is required');
    }

    const dto = await filesApiClient.updateFolder(id, { name: name.trim() });

    return {
      id: dto.id,
      name: dto.name,
      type: 'folder',
      modifiedAt: dto.updatedAt,
      createdAt: dto.createdAt,
      parentId: dto.parentId,
    } as Folder;
  }

  async deleteFolder(id: number): Promise<void> {
    if (!id || id < 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    await filesApiClient.deleteFolder(id);
  }

  searchFiles(): Promise<File[]> {
    throw new Error('Feature not implemented yet');
  }
}
