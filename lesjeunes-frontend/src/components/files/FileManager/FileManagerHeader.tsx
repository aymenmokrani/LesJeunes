'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Grid3X3,
  List,
  Upload,
  FolderPlus,
  Settings,
} from 'lucide-react';
import { useFiles } from '@/lib/hooks/useFiles';
import { useState } from 'react';

export function FileManagerHeader() {
  const { viewMode, changeViewMode, search, createFolder } = useFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await search(searchQuery.trim());
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      setIsCreatingFolder(true);
      await createFolder(name.trim());
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-foreground">My Drive</h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files and folders"
            className="w-80 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateFolder}
          disabled={isCreatingFolder}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>

        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
