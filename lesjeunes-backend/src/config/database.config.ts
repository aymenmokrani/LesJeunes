import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'dev_user',
  password: process.env.POSTGRES_PASSWORD || 'dev_password',
  database: process.env.POSTGRES_DB || 'lesjeunes_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // ← Auto-load entities
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  retryAttempts: 3, // ← Retry connection 3 times
  retryDelay: 3000, // ← Wait 3 seconds between retries
  autoLoadEntities: true, // ← Auto-discover entities
});
