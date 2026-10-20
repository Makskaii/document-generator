export type ContractType = 'CRM' | 'SITE' | 'TRAINING';
export type LegalType = 'OOO' | 'IP';
export type PaymentType = 'SINGLE' | 'DOUBLE';

export interface FullGenerateClientPayload {
  legalType: LegalType;
  name: string;
  shortName?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  ogrnip?: string;
  legalAddress?: string;
  postalAddress?: string;
  bankName?: string;
  bankAccount?: string;
  correspondentAccount?: string;
  bik?: string;
  signerPosition?: string;
  signerFullName?: string;
  signerGenitiveName?: string;
  signerShortName?: string;
  signerBase?: string;
}

export interface FullGenerateContractPayload {
  date: string;
  city?: string;
  templateCode?: string;
  type: ContractType;
  legalType: LegalType;
  paymentType: PaymentType;
  hasTz: boolean;
  prepaymentPercent?: number;
  postpaymentPercent?: number;
  servicePeriodValue?: number;
  servicePeriodUnit?: string;
  tzPeriodValue?: number;
  tzPeriodUnit?: string;
  warrantyPeriodValue?: number;
  warrantyPeriodUnit?: string;
}

export interface FullGeneratePayload {
  client: FullGenerateClientPayload;
  contract: FullGenerateContractPayload;
}

export interface FullGenerateResponse {
  contractId: number;
  generationId: number;
  fileName: string;
  downloadUrl: string;
}
