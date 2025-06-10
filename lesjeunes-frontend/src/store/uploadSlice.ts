// store/slices/uploadSlice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import {
  UploadedFile,
  UploadProgress,
} from '@/domain/upload/UploadEntities.entity';
import { UploadService } from '@/domain/upload/UploadService';
import { UploadRepository } from '@/infrastructure/upload/UploadRepositoryImpl';

// Initialize service
const uploadRepository = new UploadRepository();
const uploadService = new UploadService(uploadRepository);

// State interface
interface UploadState {
  uploads: Record<string, UploadProgress>;
  isUploading: boolean;
  error: string | null;
}

// Initial state
const initialState: UploadState = {
  uploads: {},
  isUploading: false,
  error: null,
};

// Helper function to generate upload ID
const generateUploadId = (file: File): string => {
  return `${file.name}-${file.size}-${Date.now()}`;
};

// Async thunks
export const uploadSingleFile = createAsyncThunk(
  'upload/uploadSingle',
  async (
    { file, folderId }: { file: File; folderId?: number },
    { dispatch, rejectWithValue }
  ) => {
    const uploadId = generateUploadId(file);
    try {
      // Initialize upload progress
      dispatch(
        initializeUpload({
          uploadId,
          fileName: file.name,
          totalSize: file.size,
          folderId,
        })
      );

      // Start upload
      dispatch(updateUploadStatus({ uploadId, status: 'uploading' }));

      // Update file upload progress
      const onProgress = (progress: number) => {
        dispatch(updateUploadProgress({ uploadId, progress }));
      };

      const result = await uploadService.uploadSingle(
        file,
        folderId,
        onProgress
      );

      // Complete upload
      dispatch(completeUpload({ uploadId, file: result }));

      return { uploadId, file: result };
    } catch (error: any) {
      dispatch(
        failUpload({
          uploadId,
          error: error.message || 'Upload failed',
        })
      );
      return rejectWithValue(error.message || 'Upload failed');
    }
  }
);

export const uploadMultipleFiles = createAsyncThunk(
  'upload/uploadMultiple',
  async (
    { files, folderId }: { files: File[]; folderId?: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const uploadIds: string[] = [];

      // Initialize all uploads
      files.forEach((file) => {
        const uploadId = generateUploadId(file);
        uploadIds.push(uploadId);
        dispatch(
          initializeUpload({
            uploadId,
            fileName: file.name,
            totalSize: file.size,
            folderId,
          })
        );
      });

      // Start uploads
      uploadIds.forEach((uploadId) => {
        dispatch(updateUploadStatus({ uploadId, status: 'uploading' }));
      });

      const results = await uploadService.uploadMultiple(files, folderId);

      // Complete uploads
      results.forEach((file, index) => {
        dispatch(completeUpload({ uploadId: uploadIds[index], file }));
      });

      return { uploadIds, files: results };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Multiple upload failed');
    }
  }
);

// Upload slice
const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    initializeUpload: (
      state,
      action: PayloadAction<{
        uploadId: string;
        fileName: string;
        totalSize: number;
        folderId?: number;
      }>
    ) => {
      const { uploadId, fileName, totalSize } = action.payload;
      state.uploads[uploadId] = {
        uploadId,
        fileName,
        totalSize,
        uploadedSize: 0,
        progress: 0,
        status: 'pending',
        isComplete: false,
        startedAt: new Date().toISOString(),
      };
      state.isUploading = true;
      state.error = null;
    },

    updateUploadProgress: (
      state,
      action: PayloadAction<{
        uploadId: string;
        progress: number;
      }>
    ) => {
      const { uploadId, progress } = action.payload;
      const upload = state.uploads[uploadId];
      if (upload) {
        upload.progress = progress;
        upload.status = 'uploading';
        upload.uploadedSize = Math.ceil((upload.totalSize * progress) / 100);
      }
    },

    updateUploadStatus: (
      state,
      action: PayloadAction<{
        uploadId: string;
        status: UploadProgress['status'];
      }>
    ) => {
      const { uploadId, status } = action.payload;
      const upload = state.uploads[uploadId];
      if (upload) {
        upload.status = status;
        if (status === 'uploading') {
          upload.startedAt = new Date().toISOString();
        }
      }
    },

    completeUpload: (
      state,
      action: PayloadAction<{
        uploadId: string;
        file: UploadedFile;
      }>
    ) => {
      const { uploadId } = action.payload;
      const upload = state.uploads[uploadId];
      if (upload) {
        upload.status = 'complete';
        upload.progress = 100;
        upload.uploadedSize = upload.totalSize;
        upload.isComplete = true;
        upload.completedAt = new Date().toISOString();
      }

      // Check if all uploads are complete
      const hasActiveUploads = Object.values(state.uploads).some(
        (upload) => upload.status === 'uploading' || upload.status === 'pending'
      );
      state.isUploading = hasActiveUploads;
    },

    failUpload: (
      state,
      action: PayloadAction<{
        uploadId: string;
        error: string;
      }>
    ) => {
      const { uploadId, error } = action.payload;
      const upload = state.uploads[uploadId];
      if (upload) {
        upload.status = 'error';
        upload.error = error;
        upload.isComplete = true;
      }
      state.error = error;

      // Check if all uploads are complete
      const hasActiveUploads = Object.values(state.uploads).some(
        (upload) => upload.status === 'uploading' || upload.status === 'pending'
      );
      state.isUploading = hasActiveUploads;
    },

    cancelUpload: (state, action: PayloadAction<{ uploadId: string }>) => {
      const { uploadId } = action.payload;
      const upload = state.uploads[uploadId];
      if (upload) {
        upload.status = 'cancelled';
        upload.isComplete = true;
      }

      // Check if all uploads are complete
      const hasActiveUploads = Object.values(state.uploads).some(
        (upload) => upload.status === 'uploading' || upload.status === 'pending'
      );
      state.isUploading = hasActiveUploads;
    },

    clearCompletedUploads: (state) => {
      // Remove completed uploads from state
      const activeUploads: Record<string, UploadProgress> = {};
      Object.entries(state.uploads).forEach(([key, upload]) => {
        if (upload.status !== 'complete' && upload.status !== 'cancelled') {
          activeUploads[key] = upload;
        }
      });
      state.uploads = activeUploads;
    },
  },
});

// Export actions
export const {
  initializeUpload,
  updateUploadProgress,
  updateUploadStatus,
  completeUpload,
  failUpload,
  cancelUpload,
  clearCompletedUploads,
} = uploadSlice.actions;

// Export reducer
export default uploadSlice.reducer;

// Selectors
export const selectUploads = (state: { upload: UploadState }) =>
  state.upload.uploads;
export const selectIsUploading = (state: { upload: UploadState }) =>
  state.upload.isUploading;
export const selectUploadError = (state: { upload: UploadState }) =>
  state.upload.error;
export const selectActiveUploads = createSelector([selectUploads], (uploads) =>
  Object.values(uploads).filter(
    (upload) => upload.status === 'uploading' || upload.status === 'pending'
  )
);
export const selectTotalUploadProgress = (state: { upload: UploadState }) => {
  const uploads = Object.values(state.upload.uploads);
  if (uploads.length === 0) return 0;

  const totalProgress = uploads.reduce(
    (sum, upload) => sum + upload.progress,
    0
  );
  return Math.round(totalProgress / uploads.length);
};
