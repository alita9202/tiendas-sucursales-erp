import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { InventoryStock } from '../../domain/entities/inventory-stock.entity';
import { InventoryMovement } from '../../domain/entities/inventory-movement.entity';
import { InventoryTransfer } from '../../domain/entities/inventory-transfer.entity';
import { InventoryTransferItem } from '../../domain/entities/inventory-transfer-item.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST', 'localhost');
  const port = configService.get<number>('DB_PORT', 5432);
  const username = configService.get<string>('DB_USERNAME', 'admin');
  const password = configService.get<string>('DB_PASSWORD', 'erp_secure_password_2024');
  const database = configService.get<string>('DB_DATABASE', 'inventory_service_db');
  
  return {
    type: 'postgres',
    url: `postgres://${username}:${password}@${host}:${port}/${database}?sslmode=disable`,
    entities: [InventoryStock, InventoryMovement, InventoryTransfer, InventoryTransferItem],
    synchronize: true,
    logging: configService.get<string>('NODE_ENV') === 'development',
    extra: {
      connectionTimeoutMillis: 10000,
    },
  };
};
