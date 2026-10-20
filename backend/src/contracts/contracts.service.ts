import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentsService } from '../documents/documents.service';
import { EstimatesService } from '../estimates/estimates.service';
import { EstimateUploadFile } from '../estimates/types/parsed-estimate.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { FullGenerateContractDto } from './dto/full-generate-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractNumberService } from './services/contract-number.service';
import { ContractValidationService } from './services/contract-validation.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contractNumberService: ContractNumberService,
    private readonly contractValidationService: ContractValidationService,
    private readonly estimatesService: EstimatesService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(data: CreateContractDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const template = await this.prisma.template.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    this.contractValidationService.validatePayment(data);

    const date = new Date(data.date);
    const number = await this.contractNumberService.nextNumber(date);
    const prepaymentAmount =
      data.prepaymentPercent === undefined
        ? undefined
        : (data.amount * data.prepaymentPercent) / 100;
    const postpaymentAmount =
      data.postpaymentPercent === undefined
        ? undefined
        : (data.amount * data.postpaymentPercent) / 100;

    const contract = await this.prisma.contract.create({
      data: {
        number,
        date,
        city: data.city || 'г. Пенза',
        type: data.type,
        legalType: data.legalType,
        paymentType: data.paymentType,
        hasTz: data.hasTz ?? false,
        amount: data.amount,
        prepaymentPercent: data.prepaymentPercent,
        postpaymentPercent: data.postpaymentPercent,
        prepaymentAmount,
        postpaymentAmount,
        servicePeriodValue: data.servicePeriodValue,
        servicePeriodUnit: data.servicePeriodUnit,
        tzPeriodValue: data.tzPeriodValue,
        tzPeriodUnit: data.tzPeriodUnit,
        warrantyPeriodValue: data.warrantyPeriodValue,
        warrantyPeriodUnit: data.warrantyPeriodUnit,
        clientId: data.clientId,
        templateId: data.templateId,
      } as any,
      include: {
        client: true,
        template: true,
        generations: true,
      },
    });

    this.logger.log('[contract] created', {
      contractId: contract.id,
      contractNumber: contract.number,
      templateId: contract.templateId,
      clientId: contract.clientId,
      amount: Number(contract.amount),
      prepaymentPercent: contract.prepaymentPercent,
      postpaymentPercent: contract.postpaymentPercent,
      prepaymentAmount: contract.prepaymentAmount === null ? null : Number(contract.prepaymentAmount),
      postpaymentAmount: contract.postpaymentAmount === null ? null : Number(contract.postpaymentAmount),
    });

    return contract;
  }

  findAll() {
    return this.prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        template: true,
        generations: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }).then(contracts =>
      contracts.map(contract => ({
        ...contract,
        externalSource: null,
        externalId: null,
        latestGeneration: contract.generations[0] ?? null,
        generations: undefined,
      })),
    );
  }

  async findOne(id: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        template: true,
        generations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!contract) {
      return null;
    }

    return {
      ...contract,
      externalSource: null,
      externalId: null,
    };
  }

  update(id: number, data: UpdateContractDto) {
    return this.prisma.contract.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      } as any,
    });
  }

  remove(id: number) {
    return this.prisma.contract.delete({ where: { id } });
  }

  async attachEstimate(id: number, file?: EstimateUploadFile) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const estimate = await this.estimatesService.parse(file);
    const amount = estimate.totalAmount;
    const estimateData = estimate as any;
    const stages = Array.isArray(estimateData.stages) ? estimateData.stages : [];
    const worksCount = Array.isArray(estimateData.works)
      ? estimateData.works.length
      : stages.reduce((sum, stage) => sum + (Array.isArray(stage.works) ? stage.works.length : 0), 0);

    this.logger.log('[contract-estimate] attaching estimate', {
      contractId: id,
      totalAmount: estimate.totalAmount,
      totalHours: estimate.totalHours,
      worksCount,
    });

    const prepaymentAmount =
      contract.paymentType === 'DOUBLE' && contract.prepaymentPercent !== null
        ? (amount * contract.prepaymentPercent) / 100
        : null;
    const postpaymentAmount =
      contract.paymentType === 'DOUBLE' && contract.postpaymentPercent !== null
        ? (amount * contract.postpaymentPercent) / 100
        : null;
    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: {
        estimateJson: estimate as any,
        amount,
        prepaymentAmount,
        postpaymentAmount,
      } as any,
      include: {
        client: true,
        template: true,
        generations: true,
      },
    });

    this.logger.log('[contract-estimate] amounts recalculated', {
      amount,
      prepaymentAmount,
      postpaymentAmount,
    });

    return {
      contract: updatedContract,
      estimate,
    };
  }

  generate(id: number) {
    return this.documentsService.generateContract(id);
  }

  async fullGenerate(data: FullGenerateContractDto, file?: EstimateUploadFile) {
    const client = await this.resolveClient(data);
    const templateId = await this.resolveTemplateId(data);
    const estimate = await this.estimatesService.parse(file);
    const contract = await this.create({
      ...data.contract,
      clientId: client.id,
      templateId,
      amount: estimate.totalAmount,
    });

    await this.attachEstimate(contract.id, file);
    const generation = await this.generate(contract.id);

    return {
      contractId: contract.id,
      generationId: generation.generationId,
      fileName: generation.fileName,
      downloadUrl: generation.downloadUrl,
    };
  }

  private async resolveClient(data: FullGenerateContractDto) {
    if (data.clientId) {
      this.logger.log('[client] using existing client', {
        clientId: data.clientId,
      });

      const client = await this.prisma.client.findUnique({
        where: { id: data.clientId },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      return client;
    }

    if (!data.client) {
      throw new BadRequestException('client or clientId is required');
    }

    this.logger.log('[client] creating new client', {
      legalType: data.client.legalType,
      name: data.client.name,
      inn: data.client.inn,
    });

    const client = await this.prisma.client.create({
      data: data.client,
    });

    this.logger.log('[client] created', {
      clientId: client.id,
    });

    return client;
  }

  private async resolveTemplateId(data: FullGenerateContractDto) {
    this.logger.log('[template-search] params', {
      type: data.contract.type,
      legalType: data.contract.legalType,
      paymentType: data.contract.paymentType,
      hasTz: data.contract.hasTz,
      isActive: true,
      templateId: data.contract.templateId,
      templateCode: data.contract.templateCode,
    });

    if (data.contract.templateId) {
      return data.contract.templateId;
    }

    if (data.contract.templateCode) {
      const template = await this.prisma.template.findUnique({
        where: {
          code: data.contract.templateCode,
        },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      return template.id;
    }

    const template = await this.prisma.template.findFirst({
      where: {
        isActive: true,
        type: data.contract.type,
        legalType: data.contract.legalType,
        paymentType: data.contract.paymentType,
        hasTz: data.contract.hasTz,
      },
      orderBy: { id: 'asc' },
    });

    if (!template) {
      this.logger.warn('[template-search] template not found', {
        type: data.contract.type,
        legalType: data.contract.legalType,
        paymentType: data.contract.paymentType,
        hasTz: data.contract.hasTz,
        isActive: true,
      });

      throw new NotFoundException('Template not found');
    }

    this.logger.log('[template-search] found template', {
      templateId: template.id,
      code: template.code,
      filePath: template.filePath,
    });

    return template.id;
  }
}
