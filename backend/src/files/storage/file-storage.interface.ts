export interface FileStorage {
  save(name: string, content: Buffer): Promise<string>;
  resolve(name: string): string;
}
