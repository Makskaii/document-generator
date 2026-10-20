import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [clientsCount, contractsCount, templatesCount, generatedCount] =
      await Promise.all([
        this.prisma.client.count(),
        this.prisma.contract.count(),
        this.prisma.template.count({ where: { isActive: true } }),
        this.prisma.generation.count({ where: { status: 'SUCCESS' } }),
      ]);

    return {
      clientsCount,
      contractsCount,
      templatesCount,
      generatedCount,
    };
  }
}
