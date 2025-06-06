'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFiles } from '@/lib/hooks/useFiles';

interface FileManagerBreadcrumbProps {
  currentFolder: number | null;
}

export function FileManagerBreadcrumb({
  currentFolder,
}: FileManagerBreadcrumbProps) {
  const { navigateToFolder } = useFiles();

  // Mock breadcrumb path - in real app, you'd build this from folder hierarchy
  const breadcrumbPath = currentFolder
    ? [
        { id: null, name: 'Home' },
        { id: 1, name: 'Documents' },
        // Add more path items based on currentFolder
      ]
    : [{ id: null, name: 'Home' }];

  const handleNavigate = (folderId: number | null) => {
    navigateToFolder(folderId);
  };

  return (
    <div className="flex items-center space-x-1 p-4 text-sm text-muted-foreground border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleNavigate(null)}
        className="h-8 px-2 hover:bg-accent"
      >
        <Home className="h-4 w-4" />
      </Button>

      {breadcrumbPath.slice(1).map((folder) => (
        <div key={folder.id} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate(folder.id)}
            className="h-8 px-2 hover:bg-accent text-foreground"
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
