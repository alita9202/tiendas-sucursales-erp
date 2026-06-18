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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Company Service API')
    .setDescription('API for managing companies and branches')
    .setVersion('1.0')
    .addTag('companies')
    .addTag('branches')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Company Service running on http://localhost:${process.env.PORT ?? 3001}`);
  console.log(`Swagger documentation available at http://localhost:${process.env.PORT ?? 3001}/api`);
}
bootstrap();
