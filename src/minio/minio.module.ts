// src/minio/minio.module.ts
import { Module, Global } from '@nestjs/common';
import { MinioService } from './minio.service';
import * as Minio from 'minio';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    MinioService,
    {
      provide: 'MINIO_CLIENT',
      useFactory: (config: ConfigService) => {
        const endpoint = config.get<string>('MINIO_ENDPOINT');
        const port = Number(config.get<string>('MINIO_PORT'));
        const accessKey = config.get<string>('MINIO_ACCESS_KEY');
        const secretKey = config.get<string>('MINIO_SECRET_KEY');
        const useSSL =
          config.get<string>('MINIO_USE_SSL') === 'true' ? true : false;

        if (!endpoint || !port || !accessKey || !secretKey) {
          throw new Error('MinIO configuration is missing!');
        }

        return new Minio.Client({
          endPoint: endpoint,
          port: port,
          useSSL: useSSL,
          accessKey: accessKey,
          secretKey: secretKey,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MinioService, 'MINIO_CLIENT'],
})
export class MinioModule {}
