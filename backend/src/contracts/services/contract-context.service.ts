import { Injectable } from '@nestjs/common';

@Injectable()
export class ContractContextService {
  build(contract: unknown) {
    return {
      contract,
      generatedAt: new Date().toISOString(),
    };
  }
}
