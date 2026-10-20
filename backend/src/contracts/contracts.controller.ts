import {
  Body,
  Controller,
  Delete,
  BadRequestException,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EstimateUploadFile } from '../estimates/types/parsed-estimate.type';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { FullGenerateContractDto } from './dto/full-generate-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);

  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() data: CreateContractDto) {
    return this.contractsService.create(data);
  }

  @Post('full-generate')
  @UseInterceptors(FileInterceptor('file'))
  fullGenerate(@Body('payload') payload: string, @UploadedFile() file?: EstimateUploadFile) {
    this.logger.log('[full-generate] request received');
    this.logger.log('[full-generate] file received', {
      fileName: file?.originalname,
      size: file?.buffer?.length,
    });
    this.logger.log('[full-generate] raw payload received', {
      payloadLength: payload?.length ?? 0,
    });

    if (!payload) {
      throw new BadRequestException('Payload is required');
    }

    let parsedPayload: FullGenerateContractDto;

    try {
      parsedPayload = JSON.parse(payload) as FullGenerateContractDto;
    } catch {
      throw new BadRequestException('Payload must be valid JSON');
    }

    this.logger.log('[full-generate] parsed payload', {
      type: parsedPayload.contract?.type,
      legalType: parsedPayload.contract?.legalType,
      paymentType: parsedPayload.contract?.paymentType,
      hasTz: parsedPayload.contract?.hasTz,
      date: parsedPayload.contract?.date,
      city: parsedPayload.contract?.city,
      templateId: parsedPayload.contract?.templateId,
      clientId: parsedPayload.clientId,
    });

    return this.contractsService.fullGenerate(parsedPayload, file);
  }

  @Post(':id/estimate')
  @UseInterceptors(FileInterceptor('file'))
  attachEstimate(@Param('id') id: string, @UploadedFile() file?: EstimateUploadFile) {
    return this.contractsService.attachEstimate(Number(id), file);
  }

  @Post(':id/generate')
  generate(@Param('id') id: string) {
    return this.contractsService.generate(Number(id));
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateContractDto) {
    return this.contractsService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(Number(id));
  }
}
