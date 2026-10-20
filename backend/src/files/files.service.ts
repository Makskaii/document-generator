import { Injectable } from '@nestjs/common';
import { safeFilename } from '../shared/helpers/filename.helper';
import { LocalFileStorageService } from './storage/local-file-storage.service';

@Injectable()
export class FilesService {
  constructor(private readonly storage: LocalFileStorageService) {}

  resolveTemplate(name: string) {
    return this.storage.resolve(`templates/${name}`);
  }

  resolveGenerated(name: string) {
    return this.storage.resolve(`generated/${name}`);
  }

  saveGenerated(name: string, content: Buffer) {
    return this.storage.save(`generated/${safeFilename(name)}`, content);
  }
}
