import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ExcelEstimateParser } from './parsers/excel-estimate.parser';
import { EstimateUploadFile } from './types/parsed-estimate.type';

@Injectable()
export class EstimatesService {
  private readonly logger = new Logger(EstimatesService.name);

  constructor(private readonly parser: ExcelEstimateParser) {}

  async parse(file?: EstimateUploadFile) {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('Поддерживаются только .xlsx файлы');
    }

    try {
      const estimate = await this.parser.parse(file.buffer);
      const estimateData = estimate as any;
      const stages = Array.isArray(estimateData.stages) ? estimateData.stages : [];
      const worksCount = Array.isArray(estimateData.works)
        ? estimateData.works.length
        : stages.reduce((sum, stage) => sum + (Array.isArray(stage.works) ? stage.works.length : 0), 0);

      this.logger.log('[estimate-parse] parsed successfully', {
        projectName: estimate.metadata.projectName,
        analyst: estimate.metadata.analyst,
        hourRate: estimate.metadata.hourRate,
        totalHours: estimate.totalHours,
        totalAmount: estimate.totalAmount,
        worksCount,
        stagesCount: stages.length,
        warnings: estimate.warnings,
      });

      return estimate;
    } catch (error) {
      this.logger.error('[estimate-parse] failed', {
        fileName: file.originalname,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
