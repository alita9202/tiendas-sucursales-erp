import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Sales & Invoicing Service API')
    .setDescription('Sales and invoicing management microservice')
    .setVersion('1.0')
    .addTag('sales')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  console.log(`Sales Service running on http://localhost:${port}`);
  console.log(`Swagger documentation at http://localhost:${port}/api`);
}
bootstrap();
