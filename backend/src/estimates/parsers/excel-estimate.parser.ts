import { BadRequestException, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import {
  ParsedEstimate,
  ParsedEstimateMetadata,
  ParsedEstimateStage,
  ParsedEstimateWork,
} from '../types/parsed-estimate.type';

interface EstimateColumns {
  stage: number | null;
  workName: number;
  analysis: number | null;
  setup: number | null;
  development: number | null;
  testing: number | null;
  debugging: number | null;
  approval: number | null;
  totalHours: number;
  amount: number;
}

@Injectable()
export class ExcelEstimateParser {
  async parse(buffer: Buffer): Promise<ParsedEstimate> {
    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.load(buffer as any);
    } catch {
      throw new BadRequestException('Не удалось прочитать Excel-файл');
    }

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new BadRequestException('Не удалось прочитать Excel-файл');
    }

    const rows = this.getRows(worksheet);
    const headerRowIndex = this.findHeaderRowIndex(rows);

    if (headerRowIndex === -1) {
      throw new BadRequestException('Не удалось найти строку заголовков сметы');
    }

    const columns = this.buildColumns(rows[headerRowIndex]);
    const metadata = this.extractMetadata(rows.slice(0, headerRowIndex));
    const works = this.extractWorks(rows.slice(headerRowIndex + 1), columns);

    if (works.length === 0) {
      throw new BadRequestException('В смете не найдено ни одной работы');
    }

    const warnings: string[] = [];
    const totalHours = this.round(works.reduce((sum, work) => sum + work.totalHours, 0));
    const totalAmount = this.round(works.reduce((sum, work) => sum + work.amount, 0));
    const stages = this.groupByStages(works, warnings);
    const metadataWithTotals = {
      ...metadata,
      totalHours: metadata.totalHours ?? totalHours,
      totalAmount: metadata.totalAmount ?? totalAmount,
    };

    this.validateTotals(metadataWithTotals, totalHours, totalAmount, warnings);

    return {
      metadata: metadataWithTotals,
      stages,
      totalHours,
      totalAmount,
      warnings,
    };
  }

  private getRows(worksheet: ExcelJS.Worksheet): unknown[][] {
    const rows: unknown[][] = [];

    worksheet.eachRow({ includeEmpty: true }, row => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      rows.push(values);
    });

    return rows;
  }

  private findHeaderRowIndex(rows: unknown[][]) {
    return rows.findIndex(row => {
      const cells = row.map(cell => this.normalize(this.cellToString(cell)));

      return (
        cells.some(cell => cell.includes('наименование работ')) &&
        cells.some(cell => cell.includes('всего часов')) &&
        cells.some(cell => cell.includes('деньги'))
      );
    });
  }

  private buildColumns(row: unknown[]): EstimateColumns {
    const cells = row.map(cell => this.normalize(this.cellToString(cell)));
    const workName = this.findColumn(cells, ['наименование работ']);
    const totalHours = this.findColumn(cells, ['всего часов']);
    const amount = this.findColumn(cells, ['деньги']);

    if (workName === null || totalHours === null || amount === null) {
      throw new BadRequestException('Не удалось найти строку заголовков сметы');
    }

    return {
      stage: this.findColumn(cells, ['этап проекта']),
      workName,
      analysis: this.findColumn(cells, ['анализ']),
      setup: this.findColumn(cells, ['настройка']),
      development: this.findColumn(cells, ['разработка']),
      testing: this.findColumn(cells, ['тест']),
      debugging: this.findColumn(cells, ['отладка']),
      approval: this.findColumn(cells, ['согласование', 'демонстрация']),
      totalHours,
      amount,
    };
  }

  private extractMetadata(rows: unknown[][]): ParsedEstimateMetadata {
    return {
      projectName: this.findMetadataText(rows, ['название проекта', 'проект']),
      analyst: this.findMetadataText(rows, ['аналитик']),
      salesManager: this.findMetadataText(rows, ['менеджер по продажам', 'менеджер', 'sales']),
      estimateDate: this.findMetadataText(rows, ['дата оценки', 'дата']),
      estimateStage: this.findMetadataText(rows, ['этап оценки', 'стадия оценки']),
      architectCheck: this.findMetadataText(rows, ['проверка архитектором', 'проверка сба', 'архитектор']),
      hourRate: this.findMetadataNumber(rows, ['ставка часа', 'ставка', 'стоимость часа']),
      totalHours: this.findMetadataNumber(rows, ['оценка часы', 'оценка, часы', 'всего часов', 'итого часов']),
      totalAmount: this.findMetadataNumber(rows, ['оценка деньги', 'оценка, деньги', 'оценка сумма', 'итого', 'деньги', 'сумма']),
    };
  }

  private extractWorks(rows: unknown[][], columns: EstimateColumns): ParsedEstimateWork[] {
    return rows
      .map(row => this.extractWork(row, columns))
      .filter((work): work is ParsedEstimateWork => Boolean(work));
  }

  private extractWork(row: unknown[], columns: EstimateColumns): ParsedEstimateWork | null {
    const name = this.cellToString(row[columns.workName]).trim();
    const totalHours = this.toNumber(row[columns.totalHours]);
    const amount = this.toNumber(row[columns.amount]);

    if (!name || this.isTotalRow(name) || (totalHours <= 0 && amount <= 0)) {
      return null;
    }

    return {
      name,
      stageTitle: columns.stage === null ? null : this.cellToString(row[columns.stage]).trim() || null,
      hours: {
        analysis: this.valueByColumn(row, columns.analysis),
        setup: this.valueByColumn(row, columns.setup),
        development: this.valueByColumn(row, columns.development),
        testing: this.valueByColumn(row, columns.testing),
        debugging: this.valueByColumn(row, columns.debugging),
        approval: this.valueByColumn(row, columns.approval),
      },
      totalHours,
      amount,
    };
  }

  private groupByStages(
    works: ParsedEstimateWork[],
    warnings: string[],
  ): ParsedEstimateStage[] {
    const hasStages = works.some(work => Boolean(work.stageTitle));

    if (!hasStages) {
      warnings.push(
        'В смете не заполнены этапы, все работы объединены в один этап',
      );

      return [this.createStage(1, 'Работы по проекту', works)];
    }

    const stageMap = new Map<string, ParsedEstimateWork[]>();

    for (const work of works) {
      const title = work.stageTitle ?? 'Работы по проекту';
      stageMap.set(title, [...(stageMap.get(title) ?? []), work]);
    }

    return Array.from(stageMap.entries()).map(([title, stageWorks], index) =>
      this.createStage(index + 1, title, stageWorks),
    );
  }

  private createStage(
    number: number,
    title: string,
    works: ParsedEstimateWork[],
  ): ParsedEstimateStage {
    return {
      number,
      title,
      works,
      totalHours: this.round(works.reduce((sum, work) => sum + work.totalHours, 0)),
      amount: this.round(works.reduce((sum, work) => sum + work.amount, 0)),
    };
  }

  private validateTotals(
    metadata: ParsedEstimateMetadata,
    totalHours: number,
    totalAmount: number,
    warnings: string[],
  ) {
    if (
      metadata.totalHours !== null &&
      Math.abs(metadata.totalHours - totalHours) > 0.01
    ) {
      warnings.push('Сумма часов строк отличается от общей суммы часов в шапке сметы');
    }

    if (
      metadata.totalAmount !== null &&
      Math.abs(metadata.totalAmount - totalAmount) > 0.01
    ) {
      warnings.push('Сумма строк отличается от общей суммы в шапке сметы');
    }
  }

  private findColumn(cells: string[], candidates: string[]) {
    const normalizedCandidates = candidates.map(candidate => this.normalize(candidate));
    const index = cells.findIndex(cell =>
      normalizedCandidates.some(candidate => cell.includes(candidate)),
    );

    return index === -1 ? null : index;
  }

  private findMetadataText(rows: unknown[][], labels: string[]) {
    const value = this.findMetadataValue(rows, labels);
    return value === null ? null : this.cellToString(value).trim() || null;
  }

  private findMetadataNumber(rows: unknown[][], labels: string[]) {
    const value = this.findMetadataValue(rows, labels);
    return value === null ? null : this.toNumber(value);
  }

  private findMetadataValue(rows: unknown[][], labels: string[]) {
    const normalizedLabels = labels.map(label => this.normalize(label));

    for (const row of rows) {
      for (let index = 0; index < row.length; index += 1) {
        const label = this.normalize(this.cellToString(row[index]));
        const isLabel = normalizedLabels.some(candidate => label.includes(candidate));

        if (!isLabel) {
          continue;
        }

        const nextValue = this.findNextCellValue(row, index);

        if (nextValue !== null) {
          return nextValue;
        }
      }
    }

    return null;
  }

  private findNextCellValue(row: unknown[], labelIndex: number) {
    for (let index = labelIndex + 1; index < row.length; index += 1) {
      const value = row[index];

      if (this.cellToString(value).trim()) {
        return value;
      }
    }

    return null;
  }

  private valueByColumn(row: unknown[], column: number | null) {
    return column === null ? 0 : this.toNumber(row[column]);
  }

  private isTotalRow(value: string) {
    const normalized = this.normalize(value);
    return normalized === 'итого' || normalized.startsWith('итого ');
  }

  private cellToString(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      if ('text' in value && typeof value.text === 'string') {
        return value.text;
      }

      if ('result' in value) {
        return this.cellToString(value.result);
      }

      if ('richText' in value && Array.isArray(value.richText)) {
        return value.richText.map(part => part.text ?? '').join('');
      }

      if (value instanceof Date) {
        return value.toISOString();
      }
    }

    return String(value);
  }

  private toNumber(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    const text = this.cellToString(value)
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '');
    const number = Number(text);

    return Number.isFinite(number) ? number : 0;
  }

  private normalize(value: string) {
    return value.toLowerCase().replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
