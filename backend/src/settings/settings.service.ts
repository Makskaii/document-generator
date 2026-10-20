import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.appSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  findOne(key: string) {
    return this.prisma.appSetting.findUnique({
      where: { key },
    });
  }

  upsert(data: UpsertSettingDto) {
    return this.prisma.appSetting.upsert({
      where: { key: data.key },
      create: data as any,
      update: { value: data.value as any },
    });
  }
}
