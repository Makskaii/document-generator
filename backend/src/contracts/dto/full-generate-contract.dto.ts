import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { CreateContractDto } from './create-contract.dto';

export class FullGenerateContractDto {
  clientId?: number;
  client?: CreateClientDto;
  contract!: Omit<CreateContractDto, 'clientId' | 'templateId' | 'amount'> & {
    amount?: number;
    templateId?: number;
  };
}
