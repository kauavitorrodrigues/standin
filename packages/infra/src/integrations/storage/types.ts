export interface StorageProvider {
    upload(file: Buffer, fileName: string): Promise<{ fileName: string }>;
    getUrl(fileName: string): Promise<string>;
    delete(fileName: string): Promise<void>;
}
