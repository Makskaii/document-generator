export interface ParsedEstimateMetadata {
  projectName: string | null;
  analyst: string | null;
  salesManager: string | null;
  estimateDate: string | null;
  estimateStage: string | null;
  architectCheck: string | null;
  hourRate: number | null;
  totalHours: number | null;
  totalAmount: number | null;
}

export interface ParsedEstimateWork {
  name: string;
  stageTitle: string | null;
  hours: {
    analysis: number;
    setup: number;
    development: number;
    testing: number;
    debugging: number;
    approval: number;
  };
  totalHours: number;
  amount: number;
}

export interface ParsedEstimateStage {
  number: number;
  title: string;
  works: ParsedEstimateWork[];
  totalHours: number;
  amount: number;
}

export interface ParsedEstimate {
  metadata: ParsedEstimateMetadata;
  stages: ParsedEstimateStage[];
  totalHours: number;
  totalAmount: number;
  warnings: string[];
}

export interface EstimateUploadFile {
  originalname: string;
  buffer: Buffer;
}
