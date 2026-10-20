import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto implements Partial<CreateTemplateDto> {
  code?: string;
  name?: string;
  type?: 'CRM' | 'SITE' | 'TRAINING';
  legalType?: 'OOO' | 'IP';
  paymentType?: 'SINGLE' | 'DOUBLE';
  hasTz?: boolean;
  filePath?: string;
  isActive?: boolean;
}
