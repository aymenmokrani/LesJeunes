// domain/upload/services/UploadService.ts
import {
  UploadedFile,
  UploadProgress,
} from '@/domain/upload/UploadEntities.entity';
import { IUploadRepository } from '@/domain/upload/IUploadRepository';

export class UploadService {
  constructor(private uploadRepository: IUploadRepository) {}

  async uploadSingle(
    file: File,
    folderId?: number,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    try {
      // Business validation
      if (!file) {
        throw new Error('Please select a file to upload');
      }
      if (file.size === 0) {
        throw new Error('Cannot upload an empty file');
      }
      //TODO: set file size limit here
      /*if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error('File size cannot exceed 100MB');
      }*/
      if (folderId !== undefined && folderId <= 0) {
        throw new Error('Please select a valid folder');
      }

      return await this.uploadRepository.uploadSingle(
        file,
        folderId,
        onProgress
      );
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 413) {
        throw new Error('File is too large. Please choose a smaller file');
      }
      if (apiError.status === 415) {
        throw new Error('File type is not supported');
      }
      if (apiError.status === 403) {
        throw new Error('You do not have permission to upload files here');
      }
      if (apiError.status === 507) {
        throw new Error('Not enough storage space available');
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

      throw new Error('Upload failed. Please try again');
    }
  }

  async uploadMultiple(
    files: File[],
    folderId?: number
  ): Promise<UploadedFile[]> {
    try {
      // Business validation
      if (!files || files.length === 0) {
        throw new Error('Please select at least one file to upload');
      }
      if (files.length > 10) {
        throw new Error('Cannot upload more than 10 files at once');
      }
      if (files.some((file) => file.size === 0)) {
        throw new Error('Cannot upload empty files');
      }

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 500 * 1024 * 1024) {
        // 500MB total limit
        throw new Error('Total file size cannot exceed 500MB');
      }
      if (folderId !== undefined && folderId <= 0) {
        throw new Error('Please select a valid folder');
      }

      return await this.uploadRepository.uploadMultiple(files, folderId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 413) {
        throw new Error('Files are too large. Please choose smaller files');
      }
      if (apiError.status === 415) {
        throw new Error('One or more file types are not supported');
      }
      if (apiError.status === 403) {
        throw new Error('You do not have permission to upload files here');
      }
      if (apiError.status === 507) {
        throw new Error('Not enough storage space available');
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

      throw new Error('Upload failed. Please try again');
    }
  }

  async uploadImage(file: File, folderId?: number): Promise<UploadedFile> {
    try {
      // Business validation
      if (!file) {
        throw new Error('Please select an image to upload');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      if (file.size === 0) {
        throw new Error('Cannot upload an empty image');
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit for images
        throw new Error('Image size cannot exceed 10MB');
      }
      if (!this.isValidImageType(file.type)) {
        throw new Error('Please select a JPEG, PNG, GIF, or WebP image');
      }
      if (folderId !== undefined && folderId <= 0) {
        throw new Error('Please select a valid folder');
      }

      return await this.uploadRepository.uploadImage(file, folderId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 413) {
        throw new Error('Image is too large. Please choose a smaller image');
      }
      if (apiError.status === 415) {
        throw new Error('Image format is not supported');
      }
      if (apiError.status === 403) {
        throw new Error('You do not have permission to upload images here');
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

      throw new Error('Image upload failed. Please try again');
    }
  }

  async uploadDocument(file: File, folderId?: number): Promise<UploadedFile> {
    try {
      // Business validation
      if (!file) {
        throw new Error('Please select a document to upload');
      }
      if (file.size === 0) {
        throw new Error('Cannot upload an empty document');
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit for documents
        throw new Error('Document size cannot exceed 50MB');
      }
      if (!this.isValidDocumentType(file.type)) {
        throw new Error(
          'Please select a valid document file (PDF, DOC, DOCX, TXT, etc.)'
        );
      }
      if (folderId !== undefined && folderId <= 0) {
        throw new Error('Please select a valid folder');
      }

      return await this.uploadRepository.uploadDocument(file, folderId);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 413) {
        throw new Error(
          'Document is too large. Please choose a smaller document'
        );
      }
      if (apiError.status === 415) {
        throw new Error('Document format is not supported');
      }
      if (apiError.status === 403) {
        throw new Error('You do not have permission to upload documents here');
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

      throw new Error('Document upload failed. Please try again');
    }
  }

  async uploadAvatar(file: File): Promise<UploadedFile> {
    try {
      // Business validation
      if (!file) {
        throw new Error('Please select an avatar image');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Avatar must be an image file');
      }
      if (file.size === 0) {
        throw new Error('Cannot upload an empty avatar');
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit for avatars
        throw new Error('Avatar size cannot exceed 2MB');
      }
      if (!this.isValidImageType(file.type)) {
        throw new Error(
          'Please select a JPEG, PNG, GIF, or WebP image for avatar'
        );
      }

      return await this.uploadRepository.uploadAvatar(file);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 413) {
        throw new Error(
          'Avatar image is too large. Please choose a smaller image'
        );
      }
      if (apiError.status === 415) {
        throw new Error('Avatar image format is not supported');
      }
      if (apiError.status === 403) {
        throw new Error('You do not have permission to update your avatar');
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

      throw new Error('Avatar upload failed. Please try again');
    }
  }

  async replaceFile(id: number, file: File): Promise<UploadedFile> {
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('Please select a valid file to replace');
      }
      if (!file) {
        throw new Error('Please select a replacement file');
      }
      if (file.size === 0) {
        throw new Error('Cannot upload an empty replacement file');
      }
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        throw new Error('Replacement file size cannot exceed 100MB');
      }

      return await this.uploadRepository.replaceFile(id, file);
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 404) {
        throw new Error('Original file not found');
      }
      if (apiError.status === 413) {
        throw new Error('Replacement file is too large');
      }
      if (apiError.status === 415) {
        throw new Error('Replacement file type is not supported');
      }
      if (apiError.status === 403) {
        throw new Error('You do not have permission to replace this file');
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

      throw new Error('File replacement failed. Please try again');
    }
  }

  async getUploadProgress(uploadId: string): Promise<UploadProgress> {
    try {
      if (!uploadId?.trim()) {
        throw new Error('Upload ID is required');
      }

      return await this.uploadRepository.getUploadProgress(uploadId.trim());
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 404) {
        throw new Error('Upload not found or has expired');
      }

      throw new Error('Unable to get upload progress');
    }
  }

  async uploadChunk(
    uploadId: string,
    chunk: Blob,
    chunkIndex: number
  ): Promise<UploadProgress> {
    try {
      // Business validation
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
        throw new Error('Invalid chunk index');
      }

      return await this.uploadRepository.uploadChunk(
        uploadId.trim(),
        chunk,
        chunkIndex
      );
    } catch (error: unknown) {
      const apiError = error as { status?: number; message?: string };

      if (apiError.status === 404) {
        throw new Error('Upload session not found or has expired');
      }
      if (apiError.status === 409) {
        throw new Error('Chunk already uploaded or upload completed');
      }
      if (apiError.status === 413) {
        throw new Error('Chunk size is too large');
      }

      throw new Error('Chunk upload failed. Please try again');
    }
  }

  private isValidImageType(mimeType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return validTypes.includes(mimeType.toLowerCase());
  }

  private isValidDocumentType(mimeType: string): boolean {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    return validTypes.includes(mimeType.toLowerCase());
  }
}
