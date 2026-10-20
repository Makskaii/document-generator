import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContractDto } from '../dto/create-contract.dto';

@Injectable()
export class ContractValidationService {
  validatePayment(data: CreateContractDto) {
    if (data.paymentType === 'DOUBLE') {
      const prepaymentPercent = data.prepaymentPercent ?? 0;
      const postpaymentPercent = data.postpaymentPercent ?? 0;

      if (prepaymentPercent + postpaymentPercent !== 100) {
        throw new BadRequestException(
          'Prepayment and postpayment percent sum must be 100',
        );
      }
    }
  }
}
