// hooks/upload/useUpload.ts
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadImage,
  uploadDocument,
  uploadAvatar,
  replaceFile,
  cancelUpload,
  clearCompletedUploads,
  clearAllUploads,
  clearUploadError,
  selectUploads,
  selectCompletedFiles,
  selectIsUploading,
  selectUploadError,
  selectActiveUploads,
  selectUploadProgress,
} from '@/store/uploadSlice';
import { UploadedFile } from '@/domain/upload/UploadEntities.entity';

export interface UseUploadOptions {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  autoCleanup?: boolean; // Auto-clear completed uploads after 5 seconds
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const dispatch = useAppDispatch();

  // Selectors
  const uploads = useSelector(selectUploads);
  const completedFiles = useSelector(selectCompletedFiles);
  const isUploading = useSelector(selectIsUploading);
  const uploadError = useSelector(selectUploadError);
  const activeUploads = useSelector(selectActiveUploads);
  const overallProgress = useSelector(selectUploadProgress);

  // Auto-cleanup completed uploads
  useEffect(() => {
    if (
      options.autoCleanup &&
      !isUploading &&
      Object.keys(uploads).length > 0
    ) {
      const timer = setTimeout(() => {
        dispatch(clearCompletedUploads());
      }, 2225000);
      return () => clearTimeout(timer);
    }
  }, [isUploading, uploads, options.autoCleanup, dispatch]);

  // Handle upload completion
  useEffect(() => {
    if (completedFiles.length > 0 && options.onUploadComplete) {
      options.onUploadComplete(completedFiles);
    }
  }, [completedFiles, options.onUploadComplete]);

  // Handle upload errors
  useEffect(() => {
    if (uploadError && options.onUploadError) {
      options.onUploadError(uploadError);
    }
  }, [uploadError, options.onUploadError]);

  // Validation helper
  const validateFiles = useCallback(
    (files: File[]): { valid: boolean; error?: string } => {
      if (options.maxFiles && files.length > options.maxFiles) {
        return {
          valid: false,
          error: `Cannot upload more than ${options.maxFiles} files`,
        };
      }

      if (options.maxFileSize) {
        const oversizedFile = files.find(
          (file) => file.size > options.maxFileSize!
        );
        if (oversizedFile) {
          return {
            valid: false,
            error: `File "${oversizedFile.name}" exceeds size limit of ${Math.round(options.maxFileSize! / 1024 / 1024)}MB`,
          };
        }
      }

      if (options.acceptedFileTypes) {
        const invalidFile = files.find(
          (file) =>
            !options.acceptedFileTypes!.some(
              (type) =>
                file.type === type ||
                file.name.toLowerCase().endsWith(type.replace('*', ''))
            )
        );
        if (invalidFile) {
          return {
            valid: false,
            error: `File type "${invalidFile.type}" is not supported`,
          };
        }
      }

      return { valid: true };
    },
    [options.maxFiles, options.maxFileSize, options.acceptedFileTypes]
  );

  // Upload methods
  const uploadSingle = useCallback(
    async (file: File, folderId?: number) => {
      const validation = validateFiles([file]);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return dispatch(uploadSingleFile({ file, folderId })).unwrap();
    },
    [dispatch, validateFiles]
  );

  const uploadMultiple = useCallback(
    async (files: File[], folderId?: number) => {
      const validation = validateFiles(files);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return dispatch(uploadMultipleFiles({ files, folderId })).unwrap();
    },
    [dispatch, validateFiles]
  );

  const uploadImageFile = useCallback(
    async (file: File, folderId?: number) => {
      const validation = validateFiles([file]);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      return dispatch(uploadImage({ file, folderId })).unwrap();
    },
    [dispatch, validateFiles]
  );

  const uploadDocumentFile = useCallback(
    async (file: File, folderId?: number) => {
      const validation = validateFiles([file]);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return dispatch(uploadDocument({ file, folderId })).unwrap();
    },
    [dispatch, validateFiles]
  );

  const uploadAvatarFile = useCallback(
    async (file: File) => {
      const validation = validateFiles([file]);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Avatar must be an image');
      }

      return dispatch(uploadAvatar({ file })).unwrap();
    },
    [dispatch, validateFiles]
  );

  const replaceExistingFile = useCallback(
    async (id: number, file: File) => {
      const validation = validateFiles([file]);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return dispatch(replaceFile({ id, file })).unwrap();
    },
    [dispatch, validateFiles]
  );

  // Control methods
  const cancelUploadById = useCallback(
    (uploadId: string) => {
      dispatch(cancelUpload({ uploadId }));
    },
    [dispatch]
  );

  const clearCompleted = useCallback(() => {
    dispatch(clearCompletedUploads());
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch(clearAllUploads());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearUploadError());
  }, [dispatch]);

  return {
    // State
    uploads,
    completedFiles,
    isUploading,
    uploadError,
    activeUploads,
    overallProgress,

    // Methods
    uploadSingle,
    uploadMultiple,
    uploadImage: uploadImageFile,
    uploadDocument: uploadDocumentFile,
    uploadAvatar: uploadAvatarFile,
    replaceFile: replaceExistingFile,

    // Control
    cancelUpload: cancelUploadById,
    clearCompleted,
    clearAll,
    clearError,

    // Utils
    validateFiles,
  };
};

// Specialized hooks for different upload types
export const useImageUpload = (options: UseUploadOptions = {}) => {
  const baseOptions = {
    ...options,
    acceptedFileTypes: options.acceptedFileTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB default
  };

  const upload = useUpload(baseOptions);

  return {
    ...upload,
    uploadImage: upload.uploadImage,
    uploadAvatar: upload.uploadAvatar,
  };
};

export const useDocumentUpload = (options: UseUploadOptions = {}) => {
  const baseOptions = {
    ...options,
    acceptedFileTypes: options.acceptedFileTypes || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ],
    maxFileSize: options.maxFileSize || 50 * 1024 * 1024, // 50MB default
  };

  const upload = useUpload(baseOptions);

  return {
    ...upload,
    uploadDocument: upload.uploadDocument,
  };
};

export const useAvatarUpload = (options: UseUploadOptions = {}) => {
  const baseOptions = {
    ...options,
    acceptedFileTypes: options.acceptedFileTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    maxFileSize: options.maxFileSize || 2 * 1024 * 1024, // 2MB default
    maxFiles: 1,
  };

  const upload = useUpload(baseOptions);

  return {
    ...upload,
    uploadAvatar: upload.uploadAvatar,
  };
};
