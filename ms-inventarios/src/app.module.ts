import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './infrastructure/config/typeorm.config';
import { InventoryStockController } from './presentation/controllers/inventory-stock.controller';
import { InventoryMovementController } from './presentation/controllers/inventory-movement.controller';
import { InventoryTransferController } from './presentation/controllers/inventory-transfer.controller';
import { InventoryStockService } from './application/services/inventory-stock.service';
import { InventoryMovementService } from './application/services/inventory-movement.service';
import { InventoryTransferService } from './application/services/inventory-transfer.service';
import { InventoryStockRepository } from './infrastructure/repositories/inventory-stock.repository';
import { InventoryMovementRepository } from './infrastructure/repositories/inventory-movement.repository';
import { InventoryTransferRepository } from './infrastructure/repositories/inventory-transfer.repository';

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
    TypeOrmModule.forFeature([
      InventoryStockRepository,
      InventoryMovementRepository,
      InventoryTransferRepository,
    ]),
  ],
  controllers: [
    InventoryStockController,
    InventoryMovementController,
    InventoryTransferController,
  ],
  providers: [
    InventoryStockService,
    InventoryMovementService,
    InventoryTransferService,
    InventoryStockRepository,
    InventoryMovementRepository,
    InventoryTransferRepository,
  ],
})
export class AppModule {}
