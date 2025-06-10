// storage/interfaces/storage.interface.ts - Storage Provider Contract
export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param file - File buffer to upload
   * @param path - Storage path (e.g., 'users/123/files/abc-def.jpg')
   * @returns Promise resolving to the stored file path
   */
  upload(file: Buffer, path: string): Promise<string>;

  /**
   * Upload a file stream to storage
   * @param stream - Readable stream to upload
   * @param path - Storage path (e.g., 'users/123/files/abc-def.jpg')
   * @returns Promise resolving to the stored file path
   */
  uploadStream(
    stream: import('stream').Readable,
    path: string,
  ): Promise<string>;

  /**
   * Download a file from storage
   * @param path - Storage path of the file
   * @returns Promise resolving to file buffer
   */
  download(path: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   * @param path - Storage path of the file
   * @returns Promise resolving when file is deleted
   */
  delete(path: string): Promise<void>;

  /**
   * Check if a file exists in storage
   * @param path - Storage path of the file
   * @returns Promise resolving to boolean indicating existence
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file size
   * @param path - Storage path of the file
   * @returns Promise resolving to file size in bytes
   */
  getSize(path: string): Promise<number>;

  /**
   * Get file metadata
   * @param path - Storage path of the file
   * @returns Promise resolving to file metadata
   */
  getMetadata(path: string): Promise<{
    size: number;
    lastModified: Date;
    contentType?: string;
  }>;

  /**
   * Generate a public URL for file access (if supported)
   * @param path - Storage path of the file
   * @param expiresIn - Optional expiration time in seconds
   * @returns Promise resolving to public URL or null if not supported
   */
  getPublicUrl?(path: string, expiresIn?: number): Promise<string | null>;
}
