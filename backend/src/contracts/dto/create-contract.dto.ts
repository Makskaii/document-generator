import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ContractType, LegalType, PaymentType } from '../../../generated/prisma/enums';

export class CreateContractDto {
  @IsInt()
  @IsPositive()
  clientId!: number;

  @IsInt()
  @IsPositive()
  templateId!: number;

  @IsOptional()
  @IsString()
  templateCode?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsEnum(ContractType)
  type!: ContractType;

  @IsEnum(LegalType)
  legalType!: LegalType;

  @IsEnum(PaymentType)
  paymentType!: PaymentType;

  @IsOptional()
  @IsBoolean()
  hasTz?: boolean;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  prepaymentPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  postpaymentPercent?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  servicePeriodValue?: number;

  @IsOptional()
  @IsString()
  servicePeriodUnit?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  tzPeriodValue?: number;

  @IsOptional()
  @IsString()
  tzPeriodUnit?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  warrantyPeriodValue?: number;

  @IsOptional()
  @IsString()
  warrantyPeriodUnit?: string;
}
