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
  completedFiles: UploadedFile[];
  isUploading: boolean;
  error: string | null;
}

// Initial state
const initialState: UploadState = {
  uploads: {},
  completedFiles: [],
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

export const uploadImage = createAsyncThunk(
  'upload/uploadImage',
  async (
    { file, folderId }: { file: File; folderId?: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const uploadId = generateUploadId(file);

      dispatch(
        initializeUpload({
          uploadId,
          fileName: file.name,
          totalSize: file.size,
          folderId,
        })
      );

      dispatch(updateUploadStatus({ uploadId, status: 'uploading' }));

      const result = await uploadService.uploadImage(file, folderId);

      dispatch(completeUpload({ uploadId, file: result }));

      return { uploadId, file: result };
    } catch (error: any) {
      const uploadId = generateUploadId(file);
      dispatch(
        failUpload({
          uploadId,
          error: error.message || 'Image upload failed',
        })
      );
      return rejectWithValue(error.message || 'Image upload failed');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'upload/uploadDocument',
  async (
    { file, folderId }: { file: File; folderId?: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const uploadId = generateUploadId(file);

      dispatch(
        initializeUpload({
          uploadId,
          fileName: file.name,
          totalSize: file.size,
          folderId,
        })
      );

      dispatch(updateUploadStatus({ uploadId, status: 'uploading' }));

      const result = await uploadService.uploadDocument(file, folderId);

      dispatch(completeUpload({ uploadId, file: result }));

      return { uploadId, file: result };
    } catch (error: any) {
      const uploadId = generateUploadId(file);
      dispatch(
        failUpload({
          uploadId,
          error: error.message || 'Document upload failed',
        })
      );
      return rejectWithValue(error.message || 'Document upload failed');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'upload/uploadAvatar',
  async ({ file }: { file: File }, { dispatch, rejectWithValue }) => {
    try {
      const uploadId = generateUploadId(file);

      dispatch(
        initializeUpload({
          uploadId,
          fileName: file.name,
          totalSize: file.size,
        })
      );

      dispatch(updateUploadStatus({ uploadId, status: 'uploading' }));

      const result = await uploadService.uploadAvatar(file);

      dispatch(completeUpload({ uploadId, file: result }));

      return { uploadId, file: result };
    } catch (error: any) {
      const uploadId = generateUploadId(file);
      dispatch(
        failUpload({
          uploadId,
          error: error.message || 'Avatar upload failed',
        })
      );
      return rejectWithValue(error.message || 'Avatar upload failed');
    }
  }
);

export const replaceFile = createAsyncThunk(
  'upload/replaceFile',
  async (
    { id, file }: { id: number; file: File },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const uploadId = generateUploadId(file);

      dispatch(
        initializeUpload({
          uploadId,
          fileName: file.name,
          totalSize: file.size,
        })
      );

      dispatch(updateUploadStatus({ uploadId, status: 'uploading' }));

      const result = await uploadService.replaceFile(id, file);

      dispatch(completeUpload({ uploadId, file: result }));

      return { uploadId, file: result };
    } catch (error: any) {
      const uploadId = generateUploadId(file);
      dispatch(
        failUpload({
          uploadId,
          error: error.message || 'File replacement failed',
        })
      );
      return rejectWithValue(error.message || 'File replacement failed');
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
      const { uploadId, file } = action.payload;
      const upload = state.uploads[uploadId];
      if (upload) {
        upload.status = 'complete';
        upload.progress = 100;
        upload.uploadedSize = upload.totalSize;
        upload.isComplete = true;
        upload.completedAt = new Date().toISOString();

        // Add to completed files
        state.completedFiles.push(file);

        // Remove from active uploads after a delay (handled by component)
        // delete state.uploads[uploadId];
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
      console.log('fail upload ::: ', uploadId);
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

    clearAllUploads: (state) => {
      state.uploads = {};
      state.isUploading = false;
    },

    clearUploadError: (state) => {
      state.error = null;
    },

    removeCompletedFile: (state, action: PayloadAction<{ fileId: number }>) => {
      state.completedFiles = state.completedFiles.filter(
        (file) => file.id !== action.payload.fileId
      );
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
  clearAllUploads,
  clearUploadError,
  removeCompletedFile,
} = uploadSlice.actions;

// Export reducer
export default uploadSlice.reducer;

// Selectors
export const selectUploads = (state: { upload: UploadState }) =>
  state.upload.uploads;
export const selectCompletedFiles = (state: { upload: UploadState }) =>
  state.upload.completedFiles;
export const selectIsUploading = (state: { upload: UploadState }) =>
  state.upload.isUploading;
export const selectUploadError = (state: { upload: UploadState }) =>
  state.upload.error;
export const selectUploadById =
  (uploadId: string) => (state: { upload: UploadState }) =>
    state.upload.uploads[uploadId];
export const selectActiveUploads = createSelector([selectUploads], (uploads) =>
  Object.values(uploads).filter(
    (upload) => upload.status === 'uploading' || upload.status === 'pending'
  )
);
export const selectUploadProgress = (state: { upload: UploadState }) => {
  const uploads = Object.values(state.upload.uploads);
  if (uploads.length === 0) return 0;

  const totalProgress = uploads.reduce(
    (sum, upload) => sum + upload.progress,
    0
  );
  return Math.round(totalProgress / uploads.length);
};
