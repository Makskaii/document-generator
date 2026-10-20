import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContractNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async nextNumber(date = new Date()) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const dateKey = `${day}${month}${year}`;

    const counter = await this.prisma.contractCounter.upsert({
      where: { dateKey },
      create: { dateKey, value: 1 },
      update: { value: { increment: 1 } },
    });

    return `${dateKey}-${counter.value}`;
  }
}
