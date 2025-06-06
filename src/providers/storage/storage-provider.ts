export interface StorageProvider {
  upload(file: {
    fileName: string;
    fileType: string;
    buffer: Buffer;
  }): Promise<{ url: string; key: string }>;
  
  getUrl(key: string): Promise<string>;
  
  delete(key: string): Promise<void>;
}