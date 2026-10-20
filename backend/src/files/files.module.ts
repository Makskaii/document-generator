import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { LocalFileStorageService } from './storage/local-file-storage.service';

@Module({
  providers: [FilesService, LocalFileStorageService],
  exports: [FilesService, LocalFileStorageService],
})
export class FilesModule {}
