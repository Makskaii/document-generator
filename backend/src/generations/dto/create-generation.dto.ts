export class CreateGenerationDto {
  contractId!: number;
  fileName?: string;
  filePath?: string;
  sourceDataJson?: unknown;
  createdBy?: string;
}
