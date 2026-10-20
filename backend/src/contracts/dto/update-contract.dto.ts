import { CreateContractDto } from './create-contract.dto';
import { ContractType, LegalType, PaymentType } from '../../../generated/prisma/enums';

export class UpdateContractDto implements Partial<CreateContractDto> {
  number?: string;
  date?: string;
  city?: string;
  type?: ContractType;
  legalType?: LegalType;
  paymentType?: PaymentType;
  hasTz?: boolean;
  amount?: number;
  amountText?: string;
  prepaymentPercent?: number;
  postpaymentPercent?: number;
  prepaymentAmount?: string | number;
  postpaymentAmount?: string | number;
  servicePeriodValue?: number;
  servicePeriodUnit?: string;
  tzPeriodValue?: number;
  tzPeriodUnit?: string;
  warrantyPeriodValue?: number;
  warrantyPeriodUnit?: string;
  estimateJson?: unknown;
  formDataJson?: unknown;
  clientId?: number;
  templateId?: number;
}
