'use client';

import { FileManagerHeader } from './FileManagerHeader';
import { FileManagerBreadcrumb } from './FileManagerBreadcrumb';
import { FileManagerGrid } from './FileManagerGrid';
import { useFiles } from '@/lib/hooks/useFiles';

export function FileManagerLayout() {
  const {
    files,
    folders,
    currentFolder,
    selectedItems,
    viewMode,
    isLoading,
    error,
    // Get all the functions we need to pass down
    changeViewMode,
    search,
    createFolder,
    navigateToFolder,
    selectItem,
  } = useFiles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <FileManagerHeader
        viewMode={viewMode}
        changeViewMode={changeViewMode}
        search={search}
        createFolder={createFolder}
      />
      <FileManagerBreadcrumb
        currentFolder={currentFolder}
        navigateToFolder={navigateToFolder}
      />
      <div className="flex-1 overflow-auto">
        <FileManagerGrid
          files={files}
          folders={folders}
          viewMode={viewMode}
          selectedItems={selectedItems}
          selectItem={selectItem}
          navigateToFolder={navigateToFolder}
        />
      </div>
    </div>
  );
}
