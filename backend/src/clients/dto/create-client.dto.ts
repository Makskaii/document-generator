import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LegalType } from '../../../generated/prisma/enums';

export class CreateClientDto {
  @IsEnum(LegalType)
  legalType!: LegalType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  shortName?: string;

  @IsOptional()
  @IsString()
  inn?: string;

  @IsOptional()
  @IsString()
  kpp?: string;

  @IsOptional()
  @IsString()
  ogrn?: string;

  @IsOptional()
  @IsString()
  ogrnip?: string;

  @IsOptional()
  @IsString()
  legalAddress?: string;

  @IsOptional()
  @IsString()
  postalAddress?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  correspondentAccount?: string;

  @IsOptional()
  @IsString()
  bik?: string;

  @IsOptional()
  @IsString()
  signerPosition?: string;

  @IsOptional()
  @IsString()
  signerFullName?: string;

  @IsOptional()
  @IsString()
  signerGenitiveName?: string;

  @IsOptional()
  @IsString()
  signerShortName?: string;

  @IsOptional()
  @IsString()
  signerBase?: string;
}
