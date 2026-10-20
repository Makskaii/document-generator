import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) { }

  create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!client) {
      throw new NotFoundException('Клиент не найден');
    }

    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    await this.findOne(id);

    return this.prisma.client.update({
      where: {
        id,
      },
      data: updateClientDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.client.delete({
      where: {
        id,
      },
    });
  }
}