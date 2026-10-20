import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'node:fs/promises';

const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');

@Injectable()
export class DocxTemplateRenderer {
  private readonly logger = new Logger(DocxTemplateRenderer.name);

  async render(templatePath: string, context: Record<string, unknown>) {
    this.logger.log('[docx-render] started', {
      templatePath,
    });

    try {
      const template = await readFile(templatePath);
      const zip = new PizZip(template);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}',
        },
        nullGetter: part => `{{${part.value}}}`,
      });

      doc.render(context);

      const content = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      }) as Buffer;

      this.assertNoUnresolvedPlaceholders(content);
      this.logger.log('[docx-render] completed', {
        templatePath,
      });

      return content;
    } catch (error) {
      this.logger.error('[docx-render] failed', {
        templatePath,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  private assertNoUnresolvedPlaceholders(content: Buffer) {
    this.logger.log('[placeholder-check] started');

    const zip = new PizZip(content);
    const unresolved = new Set<string>();

    for (const fileName of Object.keys(zip.files)) {
      if (!fileName.startsWith('word/') || !fileName.endsWith('.xml')) {
        continue;
      }

      const file = zip.file(fileName);
      const text = file?.asText() ?? '';
      const matches = text.match(/\{\{[^}]+}}/g) ?? [];

      for (const match of matches) {
        unresolved.add(match);
      }
    }

    if (unresolved.size > 0) {
      this.logger.warn('[placeholder-check] unresolved placeholders found', {
        placeholders: Array.from(unresolved),
      });
      throw new Error(`Unresolved document placeholders: ${Array.from(unresolved).join(', ')}`);
    }

    this.logger.log('[placeholder-check] no unresolved placeholders');
  }
}
