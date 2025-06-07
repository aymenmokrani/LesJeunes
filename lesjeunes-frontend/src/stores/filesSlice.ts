import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FilesState } from './types';
import { File, Folder } from '@/domain/files/FileEntities.entity';
import { FilesService } from '@/domain/files/FilesService';
import { FilesRepository } from '@/infrastructure/files/FilesRepositoryImpl';

const filesService = new FilesService(new FilesRepository());

export const getFiles = createAsyncThunk<
  File[],
  number | undefined,
  { rejectValue: string }
>('files/getFiles', async (folderId, { rejectWithValue }) => {
  try {
    return await filesService.getFiles(folderId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to load files'
    );
  }
});

export const getFolders = createAsyncThunk<
  Folder[],
  number | undefined,
  { rejectValue: string }
>('files/getFolders', async (parentId, { rejectWithValue }) => {
  try {
    return await filesService.getFolders(parentId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to load folders'
    );
  }
});

export const createFolder = createAsyncThunk<
  Folder,
  { name: string; parentId?: number },
  { rejectValue: string }
>('files/createFolder', async ({ name, parentId }, { rejectWithValue }) => {
  try {
    return await filesService.createFolder(name, parentId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to create folder'
    );
  }
});

export const deleteFile = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('files/deleteFile', async (fileId, { rejectWithValue }) => {
  try {
    await filesService.deleteFile(fileId);
    return fileId;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to delete file'
    );
  }
});

export const deleteFolder = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('files/deleteFolder', async (folderId, { rejectWithValue }) => {
  try {
    await filesService.deleteFolder(folderId);
    return folderId;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to delete folder'
    );
  }
});

export const updateFile = createAsyncThunk<
  File,
  { id: number; name: string },
  { rejectValue: string }
>('files/updateFile', async ({ id, name }, { rejectWithValue }) => {
  try {
    return await filesService.updateFile(id, name);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to rename file'
    );
  }
});

export const updateFolder = createAsyncThunk<
  Folder,
  { id: number; name: string },
  { rejectValue: string }
>('files/updateFolder', async ({ id, name }, { rejectWithValue }) => {
  try {
    return await filesService.updateFolder(id, name);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to rename folder'
    );
  }
});

export const searchFiles = createAsyncThunk<
  File[],
  { query: string; folderId?: number },
  { rejectValue: string }
>('files/searchFiles', async ({ query, folderId }, { rejectWithValue }) => {
  try {
    return await filesService.searchFiles(query, folderId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Search failed'
    );
  }
});

const initialState: FilesState = {
  files: [],
  folders: [],
  currentFolder: null,
  selectedItems: [],
  viewMode: 'grid',
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
      state.selectedItems = [];
    },
    toggleItemSelection: (state, action) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Files
      .addCase(getFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.files = action.payload;
        state.isLoading = false;
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load files';
      })
      // Get Folders
      .addCase(getFolders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        state.isLoading = false;
      })
      .addCase(getFolders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load folders';
      })
      // Create Folder
      .addCase(createFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
        state.isLoading = false;
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create folder';
      })
      // Delete File
      .addCase(deleteFile.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter((file) => file.id !== action.payload);
        state.selectedItems = state.selectedItems.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete file';
      })
      // Delete Folder
      .addCase(deleteFolder.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(
          (folder) => folder.id !== action.payload
        );
        state.selectedItems = state.selectedItems.filter(
          (id) => id !== action.payload
        );
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete folder';
      })
      // Update File
      .addCase(updateFile.fulfilled, (state, action) => {
        const index = state.files.findIndex(
          (file) => file.id === action.payload.id
        );
        if (index > -1) {
          state.files[index] = action.payload;
        }
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.error = action.payload || 'Failed to rename file';
      })
      // Update Folder
      .addCase(updateFolder.fulfilled, (state, action) => {
        const index = state.folders.findIndex(
          (folder) => folder.id === action.payload.id
        );
        if (index > -1) {
          state.folders[index] = action.payload;
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.error = action.payload || 'Failed to rename folder';
      })
      // Search Files
      .addCase(searchFiles.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchFiles.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.isSearching = false;
      })
      .addCase(searchFiles.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload || 'Search failed';
      });
  },
});

export const {
  clearError,
  setCurrentFolder,
  toggleItemSelection,
  clearSelection,
  setViewMode,
  clearSearchResults,
} = filesSlice.actions;

export default filesSlice.reducer;
