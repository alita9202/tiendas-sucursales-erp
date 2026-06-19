import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './infrastructure/config/typeorm.config';
import { SaleController } from './presentation/controllers/sale.controller';
import { SaleService } from './application/services/sale.service';
import { SaleRepository } from './infrastructure/repositories/sale.repository';
import { Sale } from './domain/entities/sale.entity';
import { SaleItem } from './domain/entities/sale-item.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    TypeOrmModule.forFeature([Sale, SaleItem]),
  ],
  controllers: [SaleController, AppController],
  providers: [SaleService, SaleRepository, AppService],
})
export class AppModule {}
