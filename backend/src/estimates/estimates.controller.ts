import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EstimatesService } from './estimates.service';
import { EstimateUploadFile } from './types/parsed-estimate.type';

@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  parse(@UploadedFile() file?: EstimateUploadFile) {
    return this.estimatesService.parse(file);
  }
}
