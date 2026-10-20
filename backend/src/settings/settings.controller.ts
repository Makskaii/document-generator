import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post()
  upsert(@Body() data: UpsertSettingDto) {
    return this.settingsService.upsert(data);
  }
}
