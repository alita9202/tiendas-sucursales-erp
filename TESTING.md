# 🧪 Guía de Testing y Pruebas del Sistema

## Introducción

Este documento explica cómo cada compañero puede:
1. Validar que sus cambios funcionen
2. Hacer testing del microservicio que desarrolla
3. Integrar cambios sin romper otros servicios
4. Hacer pruebas de BD realistas

---

## ✅ Pruebas Locales

### 1. Verificar que el Servicio Inicia

```bash
# En la carpeta del microservicio
cd ms-inventarios

# Verificar que inicia sin errores
npm run start

# Deberías ver:
# [Nest] 12345 - ... LOG [NestApplication] Nest application successfully started
```

### 2. Testing de Endpoints (HTTP)

```bash
# Terminal nueva - Probar API Gateway (3000)
curl http://localhost:3000

# Probar cada microservicio
curl http://localhost:3001  # ms-empresas-catalogos
curl http://localhost:3002  # ms-inventarios
curl http://localhost:3003  # ms-ventas-facturacion
curl http://localhost:3004  # ms-finanzas
```

### 3. Testing Avanzado con Postman/Insomnia

Importar colección:
```json
{
  "info": {
    "name": "ERP Microservicios",
    "description": "Colección de endpoints"
  },
  "item": [
    {
      "name": "API Gateway",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000"
      }
    },
    {
      "name": "Get All Products",
      "request": {
        "method": "GET",
        "url": "http://localhost:3002/products"
      }
    }
  ]
}
```

---

## 🗄️ Testing de Base de Datos

### Ver Estado de la BD

```bash
# Conectar a PostgreSQL
psql -U admin -h localhost -d erp_main_db

# Ver esquemas
\dn

# Ver tablas en un schema
\dt inventarios.*

# Contar registros
SELECT COUNT(*) FROM inventarios.products;

# Ver estructura tabla
\d inventarios.products

# Salir
\q
```

### Limpiar BD para Testing Limpio

```bash
# Conectar a PostgreSQL
psql -U admin -h localhost -d erp_main_db

-- Ver lo que hay
SELECT * FROM inventarios.products;

-- Limpiar tabla (cuidado!)
DELETE FROM inventarios.products;
TRUNCATE inventarios.products;

-- O recrear schema
DROP SCHEMA inventarios CASCADE;
CREATE SCHEMA inventarios;
```

### Seed de Datos para Testing

Crear archivo `src/infrastructure/database/seeds/products.seed.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class ProductSeeder {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async seed() {
    const count = await this.productRepository.count();
    
    if (count > 0) {
      console.log('Productos ya existen, saltando seed...');
      return;
    }

    const products = [
      {
        name: 'Laptop Dell',
        sku: 'DELL-001',
        price: 1200,
        stock: 50,
      },
      {
        name: 'Mouse Logitech',
        sku: 'LOGI-002',
        price: 45,
        stock: 200,
      },
    ];

    await this.productRepository.save(products);
    console.log('✅ Datos de testing insertados');
  }
}
```

Ejecutar en `main.ts`:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Seed de datos para testing
  if (process.env.NODE_ENV === 'development') {
    const seeder = app.get(ProductSeeder);
    await seeder.seed();
  }
  
  await app.listen(process.env.PORT ?? 3002);
}
```

---

## 🧬 Unit Testing

### Estructura Básica

Archivo: `src/application/services/product.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../domain/entities/product.entity';

describe('ProductService', () => {
  let service: ProductService;
  let mockProductRepository;

  beforeEach(async () => {
    // Mock del repositorio
    mockProductRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('debe retornar todos los productos', async () => {
    const mockProducts = [
      { id: 1, name: 'Laptop', price: 1200 },
      { id: 2, name: 'Mouse', price: 45 },
    ];

    mockProductRepository.find.mockResolvedValue(mockProducts);

    const result = await service.findAll();

    expect(result).toEqual(mockProducts);
    expect(mockProductRepository.find).toHaveBeenCalled();
  });

  it('debe crear un producto', async () => {
    const newProduct = { name: 'Teclado', price: 150 };
    const savedProduct = { id: 1, ...newProduct };

    mockProductRepository.save.mockResolvedValue(savedProduct);

    const result = await service.create(newProduct);

    expect(result).toEqual(savedProduct);
    expect(mockProductRepository.save).toHaveBeenCalledWith(newProduct);
  });
});
```

### Correr Tests

```bash
# Tests unitarios
npm run test

# Ver cobertura
npm run test:cov

# Watch mode (auto-rerun en cambios)
npm run test:watch

# Test específico
npm run test -- product.service.spec.ts
```

---

## 🔄 Testing E2E (End-to-End)

### Estructura

Archivo: `test/products.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('debe retornar todos los productos', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /products', () => {
    it('debe crear un nuevo producto', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          sku: 'TEST-001',
          price: 99.99,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Test Product');
        });
    });

    it('debe fallar si faltan campos', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ name: 'Test Product' })
        .expect(400);
    });
  });
});
```

### Correr E2E Tests

```bash
# E2E tests
npm run test:e2e

# Watch mode
npm run test:e2e -- --watch
```

---

## 🔗 Testing de Integración entre Servicios

### Verificar Comunicación RabbitMQ

```bash
# Acceder a RabbitMQ Dashboard
# URL: http://localhost:15672
# Usuario: guest
# Contraseña: guest

# Ver exchanges y queues
# Verificar mensajes en cola
```

### Testing de Eventos

Archivo: `src/infrastructure/messaging/product-created.event.spec.ts`

```typescript
describe('Product Created Event', () => {
  it('debe publicar evento cuando producto es creado', async () => {
    const mockAmqpConnection = {
      publish: jest.fn(),
    };

    const productService = new ProductService(
      mockProductRepository,
      mockAmqpConnection,
    );

    await productService.create({ name: 'Test', price: 100 });

    expect(mockAmqpConnection.publish).toHaveBeenCalledWith({
      exchange: 'products',
      routingKey: 'product.created',
      payload: expect.objectContaining({
        name: 'Test',
      }),
    });
  });
});
```

---

## 📊 Checklist de Testing Antes de Push

- [ ] Servicio inicia sin errores: `npm run start`
- [ ] Tests unitarios pasan: `npm run test`
- [ ] Tests E2E pasan: `npm run test:e2e`
- [ ] Linting sin errores: `npm run lint`
- [ ] Endpoints responden en Postman
- [ ] BD tiene datos si es necesario
- [ ] `.env` no está committeado
- [ ] Commit message es descriptivo

---

## 🐛 Debugging

### Logs Detallados

```bash
# En desarrollo
NODE_ENV=development npm run start:dev

# Con debug
DEBUG=* npm run start:dev

# Logs específicos de TypeORM
npm run start:dev -- --debug=typeorm:*
```

### Breakpoints en VS Code

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Inventarios",
      "program": "${workspaceFolder}/ms-inventarios/dist/main.js",
      "restart": true,
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/ms-inventarios/src/main.ts"],
      "cwd": "${workspaceFolder}/ms-inventarios",
      "console": "integratedTerminal",
      "protocol": "inspector"
    }
  ]
}
```

---

## 🚀 Pipeline CI/CD (Futuro)

GitHub Actions para validar automáticamente:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run test:e2e
```

---

¡Con esta guía podrán hacer testing profesional y colaborar sin problemas! 🎯
