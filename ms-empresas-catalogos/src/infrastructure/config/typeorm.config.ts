import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Company } from '../../domain/entities/company.entity';
import { Branch } from '../../domain/entities/branch.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST', 'localhost');
  const port = configService.get<number>('DB_PORT', 5432);
  const username = configService.get<string>('DB_USERNAME', 'admin');
  const password = configService.get<string>('DB_PASSWORD', 'erp_secure_password_2024');
  const database = configService.get<string>('DB_DATABASE', 'company_service_db');
  
  return {
    type: 'postgres',
    url: `postgres://${username}:${password}@${host}:${port}/${database}?sslmode=disable`,
    entities: [Company, Branch],
    synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
    extra: {
      connectionTimeoutMillis: 10000,
    },
  };
};
