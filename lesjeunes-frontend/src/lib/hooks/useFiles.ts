import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { unwrapResult } from '@reduxjs/toolkit';
import {
  getFiles,
  getFolders,
  createFolder,
  deleteFile,
  deleteFolder,
  updateFile,
  updateFolder,
  searchFiles,
  clearError,
  setCurrentFolder,
  toggleItemSelection,
  clearSelection,
  setViewMode,
  clearSearchResults,
} from '@/stores/filesSlice';

export const useFiles = (currentFolderId?: number) => {
  const dispatch = useAppDispatch();
  const {
    files,
    folders,
    currentFolder,
    selectedItems,
    viewMode,
    isLoading,
    error,
    searchResults,
    isSearching,
  } = useAppSelector((state) => state.files);

  useEffect(() => {
    dispatch(getFiles(currentFolderId));
    dispatch(getFolders(currentFolderId));
  }, [dispatch, currentFolderId]);

  const handleCreateFolder = async (name: string, parentId?: number) => {
    try {
      const result = await dispatch(createFolder({ name, parentId }));
      unwrapResult(result);
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      const result = await dispatch(deleteFile(fileId));
      unwrapResult(result);
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      const result = await dispatch(deleteFolder(folderId));
      unwrapResult(result);
      return true;
    } catch {
      return false;
    }
  };

  const handleRenameFile = async (id: number, name: string) => {
    try {
      const result = await dispatch(updateFile({ id, name }));
      unwrapResult(result);
      return true;
    } catch {
      return false;
    }
  };

  const handleRenameFolder = async (id: number, name: string) => {
    try {
      const result = await dispatch(updateFolder({ id, name }));
      unwrapResult(result);
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = async (query: string, folderId?: number) => {
    try {
      const result = await dispatch(searchFiles({ query, folderId }));
      unwrapResult(result);
      return true;
    } catch {
      return false;
    }
  };

  const navigateToFolder = (folderId: number | null) => {
    dispatch(setCurrentFolder(folderId));
  };

  const selectItem = (itemId: number) => {
    dispatch(toggleItemSelection(itemId));
  };

  const clearSelectedItems = () => {
    dispatch(clearSelection());
  };

  const changeViewMode = (mode: 'grid' | 'list') => {
    dispatch(setViewMode(mode));
  };

  const clearSearchData = () => {
    dispatch(clearSearchResults());
  };

  const clearFileError = () => {
    dispatch(clearError());
  };

  const refreshFiles = () => {
    dispatch(getFiles(currentFolderId));
    dispatch(getFolders(currentFolderId));
  };
  return {
    // State
    files,
    folders,
    currentFolder,
    selectedItems,
    viewMode,
    isLoading,
    error,
    searchResults,
    isSearching,

    // Actions
    createFolder: handleCreateFolder,
    deleteFile: handleDeleteFile,
    deleteFolder: handleDeleteFolder,
    renameFile: handleRenameFile,
    renameFolder: handleRenameFolder,
    search: handleSearch,
    navigateToFolder,
    selectItem,
    clearSelection: clearSelectedItems,
    changeViewMode,
    clearSearchResults: clearSearchData,
    clearError: clearFileError,
    refreshFiles,
  };
};
