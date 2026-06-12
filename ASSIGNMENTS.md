# 🎯 Asignación de Microservicios y Responsabilidades

## 👥 Distribución de Trabajo

Este documento define qué compañero trabaja en qué microservicio y cómo hacerlo sin conflictos.

---

## 📌 Asignación Sugerida

| Compañero | Microservicio | Puerto | Responsabilidades |
|-----------|---------------|--------|-------------------|
| Compañero 1 | `api-gateway` | 3000 | Autenticación, validación JWT, enrutamiento |
| Compañero 2 | `ms-empresas-catalogos` | 3001 | Gestión de empresas, catálogos, configuración |
| Compañero 3 | `ms-inventarios` | 3002 | Productos, almacenes, movimientos de stock |
| Compañero 4 | `ms-ventas-facturacion` | 3003 | Órdenes de venta, facturas, seguimiento |
| Compañero 5 | `ms-finanzas` | 3004 | Contabilidad, cuentas por cobrar/pagar |
| Compañero 6 | `dashboard-web` | 3005 | Interfaz, reportes, visualización |

---

## 🚀 Pasos para Cada Compañero

### 1️⃣ Clonar el Proyecto

```bash
git clone https://github.com/EdsonA8911/tiendas-sucursales-erp.git
cd tiendas-sucursales-erp
```

### 2️⃣ Crear tu Rama de Trabajo

```bash
# Crear rama para tu microservicio
git checkout -b feature/ms-inventarios-development

# Ejemplos:
git checkout -b feature/api-gateway-auth
git checkout -b feature/ms-empresas-catalogos-crud
```

### 3️⃣ Setup Local

```bash
# Ejecutar setup automático
./setup.sh  # o setup.bat en Windows

# Esto instala todas las dependencias
```

### 4️⃣ Crear `.env` Local

```bash
# Copiar ejemplo a real (si el script no lo hizo)
cp .env.example .env
cp ms-tu-servicio/.env.example ms-tu-servicio/.env
```

### 5️⃣ Iniciar Docker (UNA SOLA VEZ)

```bash
# En la raíz del proyecto
docker-compose up -d

# Verificar que corre
docker-compose ps
```

### 6️⃣ Desarrollar tu Microservicio

```bash
cd ms-inventarios

# Instalar dependencias (si falta algo)
npm install

# Modo desarrollo (watch - auto-reload)
npm run start:dev

# O modo normal
npm run start
```

---

## 🗄️ Estrategia de Base de Datos

### Cada Compañero Tiene su Esquema

PostgreSQL se usa con múltiples **esquemas** dentro de la misma BD:

```
erp_main_db (UNA sola BD compartida)
├── public.users                    (Empresas/Tenants)
├── inventarios.products            (Compañero 3)
├── inventarios.warehouses
├── inventarios.movements
├── ventas_facturacion.orders       (Compañero 4)
├── ventas_facturacion.invoices
├── finanzas.accounts               (Compañero 5)
├── finanzas.journal_entries
└── api_gateway.tokens              (Compañero 1)
```

### Crear tu Schema

```bash
# Conectar a la BD
psql -U admin -h localhost -d erp_main_db

-- Crear tu schema (ejecutar una sola vez)
CREATE SCHEMA inventarios;
CREATE SCHEMA ventas_facturacion;

-- Crear tabla de ejemplo
CREATE TABLE inventarios.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ver tu tabla
\d inventarios.products

-- Salir
\q
```

### Insertar Datos de Prueba

```bash
psql -U admin -h localhost -d erp_main_db

-- Insertar datos
INSERT INTO inventarios.products (name, sku, price, stock) VALUES
('Laptop Dell', 'DELL-001', 1200.00, 50),
('Mouse Logitech', 'LOGI-002', 45.00, 200),
('Teclado Mecánico', 'KEYCH-001', 150.00, 100);

-- Ver datos
SELECT * FROM inventarios.products;
```

---

## 🔄 Flujo de Desarrollo Diario

### Mañana: Empezar

```bash
# 1. Actualizar código desde main
git fetch origin
git rebase origin/develop

# 2. Instalar cambios si hay
npm install

# 3. Levantar BD (si bajaste nueva máquina)
docker-compose up -d

# 4. Ejecutar en modo desarrollo
npm run start:dev
```

### Durante el Día: Trabajar

```bash
# Hacer cambios en tu microservicio
# ... editar archivos ...

# Testing local
npm run test
npm run test:e2e

# Commitear cambios
git add .
git commit -m "feat: Add product CRUD endpoints"

# Enviar a GitHub
git push origin feature/tu-rama
```

### Tarde: Antes de Terminar

```bash
# Asegúrate que compiló sin errores
npm run build

# Tests pasan
npm run test

# Enviar cambios finales
git push origin feature/tu-rama

# Crear PR si está listo para revisar
# (en GitHub web)
```

---

## 🧪 Testing tu Microservicio

### Paso 1: Unit Tests

```bash
cd ms-inventarios

# Ejecutar tests
npm run test

# Ver cobertura
npm run test:cov

# Watch mode
npm run test:watch
```

### Paso 2: Verificar Endpoints

```bash
# Mientras corre tu servicio, en otra terminal:

# GET - obtener productos
curl http://localhost:3002/products

# POST - crear producto
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "price": 99.99,
    "stock": 100
  }'

# GET específico
curl http://localhost:3002/products/1

# PUT - actualizar
curl -X PUT http://localhost:3002/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 89.99}'

# DELETE
curl -X DELETE http://localhost:3002/products/1
```

### Paso 3: Testing con Postman

1. Descargar [Postman](https://www.postman.com/downloads/)
2. Crear colección "ERP Microservicios"
3. Guardar requests frecuentes
4. Exportar colección y commitear en `/postman` folder

---

## 🔗 Comunicación Entre Servicios

Si tu microservicio necesita llamar a otro:

### Cliente HTTP (REST)

```typescript
// src/infrastructure/http-client/products.client.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ProductsClient {
  constructor(private httpService: HttpService) {}

  async getProduct(productId: number) {
    try {
      const response = await this.httpService.get(
        `http://localhost:3002/products/${productId}`,
      ).toPromise();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get product: ${error.message}`);
    }
  }
}
```

### Mensajería (RabbitMQ)

```typescript
// src/infrastructure/messaging/order-event.publisher.ts
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@nestjs-plus/rabbitmq';

@Injectable()
export class OrderEventPublisher {
  constructor(private amqpConnection: AmqpConnection) {}

  async publishOrderCreated(orderId: number) {
    await this.amqpConnection.publish(
      'orders',           // exchange
      'order.created',    // routingKey
      {
        orderId,
        timestamp: new Date(),
      },
    );
  }
}
```

---

## 🚫 Lo Que NO Hacer

❌ No editar archivos de otros microservicios
❌ No hacer push a `main` directamente
❌ No commitear archivos `.env`
❌ No modificar `docker-compose.yml` sin coordinación
❌ No borrar esquemas ajenos de la BD
❌ No hacer merge PRs sin revisión

---

## ✅ Checklist Antes de Push

- [ ] Servicio inicia sin errores
- [ ] Tests pasan: `npm run test`
- [ ] Build compila: `npm run build`
- [ ] BD tiene datos si es necesario
- [ ] Endpoints responden en curl/Postman
- [ ] `.env` NO está en commit
- [ ] Commit message es descriptivo
- [ ] PR tiene descripción clara

---

## 📊 Integración Continua

Cuando todos empujen a `develop`:

```
Tu rama    ──PR──> develop ──PR──> main (release)
Otros     ──PR──> develop
```

GitHub Actions ejecutará automáticamente:
- Tests de tu código
- Linting
- Build
- Coverage

Si falla algo, no se puede mergear.

---

## 📞 Resolver Problemas

### "Mi servicio no inicia"

```bash
# 1. Ver error específico
npm run start:dev

# 2. Ver logs
npm run build  # ¿Compila?

# 3. Resetear
rm -rf node_modules package-lock.json
npm install

# 4. Check BD
psql -U admin -h localhost -d erp_main_db -c "SELECT * FROM inventarios.products;"
```

### "Conflicto con otro compañero"

```bash
# 1. Actualizar develop
git fetch origin
git rebase origin/develop

# 2. Resolver conflictos manualmente
# (abrir archivo y elegir versión)

# 3. Continuar rebase
git rebase --continue

# 4. Force push en tu rama
git push --force-with-lease origin feature/tu-rama
```

### "BD corrupta o cambios raros"

```bash
# 1. Resetear esquema completo
psql -U admin -h localhost -d erp_main_db

DROP SCHEMA inventarios CASCADE;
CREATE SCHEMA inventarios;

# 2. Re-ejecutar migraciones
npm run typeorm migration:run

# 3. Re-seed datos
npm run seed
```

---

## 🎯 Objetivos de Cada Sprint

Ejemplo de tareas por microservicio:

**Sprint 1 - Semana 1:**
- [ ] Setup completado
- [ ] Esquema BD creado
- [ ] CRUD básico (Create, Read, Update, Delete)
- [ ] Tests unitarios
- [ ] Documentación

**Sprint 2 - Semana 2:**
- [ ] Validaciones
- [ ] Manejo de errores
- [ ] Tests E2E
- [ ] Integración con otros servicios

**Sprint 3 - Semana 3:**
- [ ] Optimizaciones
- [ ] Performance
- [ ] Documentación API

---

¡Ahora cada compañero sabe exactamente qué hacer! 🚀
