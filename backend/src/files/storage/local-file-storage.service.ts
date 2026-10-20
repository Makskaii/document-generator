import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { FileStorage } from './file-storage.interface';

@Injectable()
export class LocalFileStorageService implements FileStorage {
  private readonly root = process.env.STORAGE_ROOT ?? './storage';

  async save(name: string, content: Buffer) {
    const target = join(this.root, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
    return target;
  }

  resolve(name: string) {
    return join(this.root, name);
  }
}
