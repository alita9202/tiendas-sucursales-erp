import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors();

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Service API')
    .setDescription('Inventory Management Microservice API')
    .setVersion('1.0')
    .addTag('inventory-stock')
    .addTag('inventory-movement')
    .addTag('inventory-transfer')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`Inventory Service running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
