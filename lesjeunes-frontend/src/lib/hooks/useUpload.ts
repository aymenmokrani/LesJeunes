// hooks/upload/useUpload.ts
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  cancelUpload,
  clearCompletedUploads,
  selectUploads,
  selectIsUploading,
  selectUploadError,
  selectActiveUploads,
  selectTotalUploadProgress,
} from '@/store/uploadSlice';

export interface UseUploadOptions {
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const dispatch = useAppDispatch();

  // Selectors
  const uploads = useSelector(selectUploads);
  const isUploading = useSelector(selectIsUploading);
  const uploadError = useSelector(selectUploadError);
  const activeUploads = useSelector(selectActiveUploads);
  const overallProgress = useSelector(selectTotalUploadProgress);

  // Handle upload errors
  useEffect(() => {
    if (uploadError && options.onUploadError) {
      options.onUploadError(uploadError);
    }
  }, [uploadError, options.onUploadError, options]);

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

  return {
    // State
    uploads,
    isUploading,
    uploadError,
    activeUploads,
    overallProgress,

    // Methods
    uploadSingle,
    uploadMultiple,

    // Control
    cancelUpload: cancelUploadById,
    clearCompleted,

    // Utils
    validateFiles,
  };
};
