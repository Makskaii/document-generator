import { Body, Controller, Get, NotFoundException, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { GenerationService } from './generation.service';

@Controller('generations')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  create(@Body() data: CreateGenerationDto) {
    return this.generationService.create(data);
  }

  @Get()
  findAll() {
    return this.generationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generationService.findOne(Number(id));
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() response: Response) {
    const generation = await this.generationService.findOne(Number(id));

    if (!generation?.filePath || !generation.fileName) {
      throw new NotFoundException('Generated file not found');
    }

    return response.download(generation.filePath, generation.fileName);
  }
}
