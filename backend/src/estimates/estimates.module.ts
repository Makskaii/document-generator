import { Module } from '@nestjs/common';
import { EstimatesController } from './estimates.controller';
import { EstimatesService } from './estimates.service';
import { ExcelEstimateParser } from './parsers/excel-estimate.parser';

@Module({
  controllers: [EstimatesController],
  providers: [EstimatesService, ExcelEstimateParser],
  exports: [EstimatesService],
})
export class EstimatesModule {}
