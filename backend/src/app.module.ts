import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import storageConfig from './config/storage.config';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ContractsModule } from './contracts/contracts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentsModule } from './documents/documents.module';
import { EstimatesModule } from './estimates/estimates.module';
import { FilesModule } from './files/files.module';
import { GenerationModule } from './generations/generation.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { TemplatesModule } from './templates/templates.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, jwtConfig, storageConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    ContractsModule,
    DashboardModule,
    DocumentsModule,
    EstimatesModule,
    FilesModule,
    GenerationModule,
    HealthModule,
    SettingsModule,
    TemplatesModule,
  ],
})
export class AppModule {}
