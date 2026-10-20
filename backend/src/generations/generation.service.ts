import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenerationDto } from './dto/create-generation.dto';

@Injectable()
export class GenerationService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateGenerationDto) {
    return this.prisma.generation.create({
      data: data as any,
      include: { contract: true },
    });
  }

  createProcessing(data: CreateGenerationDto) {
    return this.prisma.generation.create({
      data: {
        ...data,
        status: 'PROCESSING',
      } as any,
    });
  }

  findAll() {
    return this.prisma.generation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          include: {
            client: true,
            template: true,
          },
        },
      },
    }).then(generations =>
      generations.map(generation => ({
        ...generation,
        externalSource: null,
        externalId: null,
      })),
    );
  }

  async findOne(id: number) {
    const generation = await this.prisma.generation.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            client: true,
            template: true,
          },
        },
      },
    });

    if (!generation) {
      return null;
    }

    return {
      ...generation,
      externalSource: null,
      externalId: null,
    };
  }

  markSuccess(id: number, fileName: string, filePath: string) {
    return this.prisma.generation.update({
      where: { id },
      data: {
        status: 'SUCCESS',
        fileName,
        filePath,
      },
    });
  }

  markFailed(id: number, errorMessage: string) {
    return this.prisma.generation.update({
      where: { id },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });
  }
}
