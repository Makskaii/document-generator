import { Module } from '@nestjs/common';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';
import { DocumentGenerationProcessor } from './processors/document-generation.processor';

@Module({
  controllers: [GenerationController],
  providers: [GenerationService, DocumentGenerationProcessor],
  exports: [GenerationService],
})
export class GenerationModule {}
