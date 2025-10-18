import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('E-learning API')
    .setDescription('API documentation for the E-learning platform')
    .setVersion('1.0')
    .addBearerAuth() // if you want JWT auth support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  app.enableCors({
    origin: 'http://localhost:5174', // React dev server
    credentials: true,              // allow cookies if needed
  });

  await app.listen(3000);
}
bootstrap();