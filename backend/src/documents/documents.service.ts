import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { access } from 'node:fs/promises';
import { FilesService } from '../files/files.service';
import { GenerationService } from '../generations/generation.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentContextBuilder } from './builders/document-context.builder';
import { DocxTemplateRenderer } from './renderers/docx-template.renderer';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contextBuilder: DocumentContextBuilder,
    private readonly renderer: DocxTemplateRenderer,
    private readonly filesService: FilesService,
    private readonly generationService: GenerationService,
  ) {}

  async preview(contractId: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { client: true, template: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return this.contextBuilder.build(contract);
  }

  async generateContract(contractId: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { client: true, template: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (!contract.template) {
      throw new NotFoundException('Template not found');
    }

    const templatePath = this.filesService.resolveTemplate(contract.template.filePath);
    this.logger.log('[template-file] resolved file path', {
      templateFilePath: contract.template.filePath,
      fullPath: templatePath,
    });

    try {
      await access(templatePath);
      this.logger.log('[template-file] file exists', {
        exists: true,
        fullPath: templatePath,
      });
    } catch {
      this.logger.warn('[template-file] file exists', {
        exists: false,
        fullPath: templatePath,
      });
      throw new NotFoundException(`Template file not found: ${templatePath}`);
    }

    const context = this.contextBuilder.build(contract);
    this.logger.log('[document-context] built', {
      contextKeys: Object.keys(context),
      estimateWorksCount: Array.isArray(context.estimate_works) ? context.estimate_works.length : 0,
      amountNumber: context.amount_number,
      amountTextExists: Boolean(context.amount_text),
      servicePeriodText: context.service_period_text,
      tzPeriodText: context.tz_period_text,
      warrantyPeriodText: context.warranty_period_text,
    });

    const generation = await this.generationService.createProcessing({
      contractId: contract.id,
      sourceDataJson: context,
    });

    try {
      const fileName = `contract_${contract.number}.docx`;
      const outputPath = this.filesService.resolveGenerated(fileName);
      this.logger.log('[docx-render] started', {
        templatePath,
        outputPath,
      });
      const content = await this.renderer.render(templatePath, context);
      const filePath = await this.filesService.saveGenerated(fileName, content);
      this.logger.log('[docx-render] completed', {
        outputPath: filePath,
      });
      const updatedGeneration = await this.generationService.markSuccess(
        generation.id,
        fileName,
        filePath,
      );

      return {
        generationId: updatedGeneration.id,
        status: updatedGeneration.status,
        fileName,
        downloadUrl: `/generations/${updatedGeneration.id}/download`,
      };
    } catch (error) {
      await this.generationService.markFailed(
        generation.id,
        error instanceof Error ? error.message : 'Document generation failed',
      );
      throw error;
    }
  }
}
