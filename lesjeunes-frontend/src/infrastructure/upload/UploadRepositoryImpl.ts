// infrastructure/upload/repositories/UploadRepository.ts
import {
  UploadedFile,
  UploadProgress,
} from '@/domain/upload/UploadEntities.entity';
import { IUploadRepository } from '@/domain/upload/IUploadRepository';
import { uploadApiClient } from '@/infrastructure/upload/uploadApi';

export class UploadRepository implements IUploadRepository {
  async uploadSingle(file: File, folderId?: number): Promise<UploadedFile> {
    // Input validation
    if (!file) {
      throw new Error('File is required');
    }
    if (file.size === 0) {
      throw new Error('Cannot upload empty file');
    }
    if (folderId !== undefined && folderId <= 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const dto = await uploadApiClient.single(formData);

    // Transform API response to domain entity
    return {
      id: dto.id,
      name: dto.fileName,
      originalName: dto.originalName,
      size: dto.size,
      mimeType: dto.mimeType,
      //TODO: add upload date
      //uploadedAt: new Date(dto.),
      folderId: Number(dto.folder),
    } as UploadedFile;
  }

  async uploadMultiple(
    files: File[],
    folderId?: number
  ): Promise<UploadedFile[]> {
    // Input validation
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }
    if (files.some((file) => file.size === 0)) {
      throw new Error('Cannot upload empty files');
    }
    if (folderId !== undefined && folderId <= 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const dtos = await uploadApiClient.multiple(formData);

    // Transform API response to domain entities
    return dtos.map(
      (dto) =>
        ({
          id: dto.id,
          name: dto.fileName,
          originalName: dto.originalName,
          size: dto.size,
          mimeType: dto.mimeType,
          //TODO: add upload date
          //uploadedAt: new Date(dto.),
          folderId: Number(dto.folder),
        }) as UploadedFile
    );
  }

  async uploadImage(file: File, folderId?: number): Promise<UploadedFile> {
    // Input validation
    if (!file) {
      throw new Error('Image file is required');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    if (file.size === 0) {
      throw new Error('Cannot upload empty image');
    }
    if (folderId !== undefined && folderId <= 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const dto = await uploadApiClient.image(formData);

    return {
      id: dto.id,
      name: dto.fileName,
      originalName: dto.originalName,
      size: dto.size,
      mimeType: dto.mimeType,
      //TODO: add upload date
      //uploadedAt: new Date(dto.),
      folderId: Number(dto.folder),
    } as UploadedFile;
  }

  async uploadDocument(file: File, folderId?: number): Promise<UploadedFile> {
    // Input validation
    if (!file) {
      throw new Error('Document file is required');
    }
    if (file.size === 0) {
      throw new Error('Cannot upload empty document');
    }
    if (folderId !== undefined && folderId <= 0) {
      throw new Error('Invalid folder ID: must be a positive number');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const dto = await uploadApiClient.document(formData);

    return {
      id: dto.id,
      name: dto.fileName,
      originalName: dto.originalName,
      size: dto.size,
      mimeType: dto.mimeType,
      //TODO: add upload date
      //uploadedAt: new Date(dto.),
      folderId: Number(dto.folder),
    } as UploadedFile;
  }

  async uploadAvatar(file: File): Promise<UploadedFile> {
    // Input validation
    if (!file) {
      throw new Error('Avatar file is required');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Avatar must be an image');
    }
    if (file.size === 0) {
      throw new Error('Cannot upload empty avatar');
    }

    const formData = new FormData();
    formData.append('file', file);

    const dto = await uploadApiClient.avatar(formData);

    return {
      id: dto.id,
      name: dto.fileName,
      originalName: dto.originalName,
      size: dto.size,
      mimeType: dto.mimeType,
      //TODO: add upload date
      //uploadedAt: new Date(dto.),
      folderId: Number(dto.folder),
    } as UploadedFile;
  }

  async replaceFile(id: number, file: File): Promise<UploadedFile> {
    // Input validation
    if (!id || id <= 0) {
      throw new Error('Invalid file ID: must be a positive number');
    }
    if (!file) {
      throw new Error('Replacement file is required');
    }
    if (file.size === 0) {
      throw new Error('Cannot upload empty file');
    }

    const formData = new FormData();
    formData.append('file', file);

    const dto = await uploadApiClient.replace(id, formData);

    return {
      id: dto.id,
      name: dto.fileName,
      originalName: dto.originalName,
      size: dto.size,
      mimeType: dto.mimeType,
      //TODO: add upload date
      //uploadedAt: new Date(dto.),
      folderId: Number(dto.folder),
    } as UploadedFile;
  }

  async getUploadProgress(uploadId: string): Promise<UploadProgress> {
    // Input validation
    if (!uploadId?.trim()) {
      throw new Error('Upload ID is required');
    }

    const dto = await uploadApiClient.getProgress(uploadId.trim());

    // Transform API response to domain entity
    return {
      uploadId: dto.uploadId,
      progress: dto.progress,
      status: dto.status,
    } as UploadProgress;
  }

  async uploadChunk(
    uploadId: string,
    chunk: Blob,
    chunkIndex: number
  ): Promise<UploadProgress> {
    // Input validation
    if (!uploadId?.trim()) {
      throw new Error('Upload ID is required');
    }
    if (!chunk) {
      throw new Error('Chunk data is required');
    }
    if (chunk.size === 0) {
      throw new Error('Cannot upload empty chunk');
    }
    if (chunkIndex < 0) {
      throw new Error('Invalid chunk index: must be non-negative');
    }

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());

    const dto = await uploadApiClient.uploadChunk(uploadId.trim(), formData);

    return {
      uploadId: dto.uploadId,
      progress: dto.progress,
      status: dto.status,
    } as UploadProgress;
  }
}
