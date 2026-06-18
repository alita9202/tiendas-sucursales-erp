import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './infrastructure/config/typeorm.config';
import { CompanyController } from './presentation/controllers/company.controller';
import { BranchController } from './presentation/controllers/branch.controller';
import { CompanyService } from './application/services/company.service';
import { BranchService } from './application/services/branch.service';
import { CompanyRepository } from './infrastructure/repositories/company.repository';
import { BranchRepository } from './infrastructure/repositories/branch.repository';
import { Company } from './domain/entities/company.entity';
import { Branch } from './domain/entities/branch.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Company, Branch]),
  ],
  controllers: [CompanyController, BranchController],
  providers: [
    CompanyService,
    BranchService,
    CompanyRepository,
    BranchRepository,
  ],
})
export class AppModule {}
