import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) { }

  async findAll() {
    const templates = await this.prisma.template.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    const templatesPath =
      this.configService.get<string>('storage.templatesPath') ||
      './storage/templates';

    return templates.map(template => {
      const fullPath = join(templatesPath, template.filePath);
      const fileExists = existsSync(fullPath);
      this.logger.log('[template-file] file exists', {
        templatesPath,
        templateFilePath: template.filePath,
        fullPath,
        exists: fileExists,
      });

      return {
        id: template.id,
        code: template.code,
        name: template.name,
        type: template.type,
        legalType: template.legalType,
        paymentType: template.paymentType,
        hasTz: template.hasTz,
        isActive: template.isActive,
        filePath: template.filePath,
        fileExists,
      };
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.template.findUnique({
      where: {
        id,
      },
    });

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    const templatesPath =
      this.configService.get<string>('storage.templatesPath') ||
      './storage/templates';

    const fullPath = join(templatesPath, template.filePath);
    const fileExists = existsSync(fullPath);

    this.logger.log('[template-file] file exists', {
      templatesPath,
      templateFilePath: template.filePath,
      fullPath,
      exists: fileExists,
    });

    return {
      id: template.id,
      code: template.code,
      name: template.name,
      type: template.type,
      legalType: template.legalType,
      paymentType: template.paymentType,
      hasTz: template.hasTz,
      isActive: template.isActive,
      filePath: template.filePath,
      fileExists,
    };
  }
}
