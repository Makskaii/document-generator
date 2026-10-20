import { Injectable } from '@nestjs/common';

@Injectable()
export class EstimateTableBuilder {
  build(items: unknown[] = []) {
    return items;
  }
}
