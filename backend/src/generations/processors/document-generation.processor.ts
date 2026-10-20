import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentGenerationProcessor {
  process(data: unknown) {
    return {
      data,
      processedAt: new Date().toISOString(),
    };
  }
}
