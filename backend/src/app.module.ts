import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsModule } from './rooms/rooms.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'hotel'),
        autoLoadEntities: true,
        // NOTE: synchronize auto-creates the schema. Acceptable for this course
        // project; use migrations in a real production system.
        synchronize: true,
        // The database container may still be starting up.
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    RoomsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
