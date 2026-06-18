# Arquitectura de Bases de Datos Distribuidas - Microservicios

Este documento describe la adaptación de la base de datos MVP centralizada a una arquitectura de microservicios con bases de datos separadas.

## Visión General

La base de datos original `supermarket_mvp_db` (centralizada) ha sido dividida en 6 bases de datos independientes, una por cada microservicio, siguiendo los principios de Domain Driven Design (DDD).

## Microservicios y Bases de Datos

### 1. Company Service
**Base de datos:** `company_service_db`

**Tablas:**
- `companies` - Información de empresas/tenants
- `branches` - Sucursales de cada empresa

**Responsabilidades:**
- Gestión de compañías
- Gestión de sucursales
- Información de ciudades y direcciones

**Eventos publicados:**
- CompanyCreated
- CompanyUpdated
- BranchCreated
- BranchUpdated

---

### 2. Product Service
**Base de datos:** `product_service_db`

**Tablas:**
- `categories` - Categorías de productos
- `brands` - Marcas de productos
- `products` - Catálogo de productos (código, barcode, nombre, precio, estado)

**Responsabilidades:**
- CRUD de productos
- Gestión de categorías
- Gestión de marcas
- Código de barras
- Precio base y precio de venta
- Estado del producto

**Eventos publicados:**
- ProductCreated
- ProductUpdated
- ProductDeleted

---

### 3. Customer Service
**Base de datos:** `customer_service_db`

**Tablas:**
- `customers` - Información de clientes
- `customer_history` - Historial de puntos y eventos
- `customer_discounts` - Descuentos asignados a clientes

**Responsabilidades:**
- Gestión de clientes
- Programa de fidelización
- Puntos (contador de compras)
- Historial de transacciones
- Descuentos

**Eventos publicados:**
- CustomerCreated
- PointsAssigned
- CustomerUpdated

---

### 4. Inventory Service
**Base de datos:** `inventory_service_db`

**Tablas:**
- `inventory_stock` - Stock por sucursal y producto
- `inventory_movements` - Kardex de movimientos (IN, OUT, SALE, TRANSFER, LOSS)
- `inventory_transfers` - Transferencias entre sucursales
- `inventory_transfer_items` - Ítems de transferencia

**Responsabilidades:**
- Stock por sucursal
- Ingreso de mercadería
- Bajas de inventario
- Transferencias entre sucursales
- Kardex de movimientos
- Importación desde Excel

**Eventos publicados:**
- InventoryLoaded
- InventoryUpdated
- TransferCompleted
- StockLow

---

### 5. Sales Service
**Base de datos:** `sales_service_db`

**Tablas:**
- `sales` - Cabecera de ventas
- `sale_items` - Detalle de ventas

**Responsabilidades:**
- Registrar ventas
- Consultar productos (vía API)
- Consultar stock (vía API)
- Descontar inventario (vía eventos)
- Registrar pagos
- Generar comprobantes

**Eventos publicados:**
- SaleCreated
- SaleCancelled
- SaleCompleted

---

### 6. Notification Service
**Base de datos:** `notification_service_db`

**Tablas:**
- `notifications` - Registro de notificaciones enviadas
- `notification_templates` - Plantillas de notificaciones

**Responsabilidades:**
- Escuchar eventos de otros servicios
- Generar notificaciones (Email, SMS, WhatsApp, Telegram, Push)
- Registrar historial de notificaciones
- Gestión de plantillas

**Eventos consumidos:**
- SaleCompleted
- TransferCompleted
- PointsAssigned
- PromotionCreated
- StockLow

---

## Comunicación Entre Servicios

### REST (Síncrona)
Para operaciones de consulta:
- Sales → Inventory (consultar stock)
- Sales → Product (consultar productos)
- Sales → Customer (consultar cliente)

### Mensajería (Asíncrona)
Para eventos de dominio:
- Sales → RabbitMQ → Inventory (actualizar stock)
- Sales → RabbitMQ → Customer (asignar puntos)
- Sales → RabbitMQ → Notification (enviar notificación)
- Inventory → RabbitMQ → Notification (alerta stock bajo)

---

## Integridad Referencial

**IMPORTANTE:** No hay foreign keys físicas entre bases de datos de diferentes servicios. La integridad se mantiene a través de:
- IDs compartidos (UUIDs)
- Validación a nivel de aplicación
- Eventos de dominio para sincronización

---

## Scripts de Instalación

Cada microservicio tiene sus propios scripts en su carpeta correspondiente:
- `00-create-database.sql` - Crea la base de datos
- `01-schema.sql` - Define el esquema
- `02-seed-demo.sql` - Datos de prueba

---

## Diferencias con la Base de Datos MVP Centralizada

### Base de datos MVP original (`supermarket_mvp_db`):
- Todas las tablas en una sola base de datos
- Foreign keys físicas entre tablas
- Funciones almacenadas que cruzan dominios
- Vistas que unen múltiples tablas

### Arquitectura de microservicios:
- 6 bases de datos independientes
- Sin foreign keys cruzadas entre servicios
- Lógica de negocio en código de aplicación
- Comunicación vía REST y RabbitMQ
- Cada servicio es autónomo y desplegable independientemente

---

## Próximos Pasos

1. Implementar los microservicios NestJS para cada servicio
2. Configurar TypeORM/Prisma para cada base de datos
3. Implementar los endpoints REST según especificación
4. Configurar RabbitMQ para eventos
5. Implementar la lógica de negocio en lugar de funciones almacenadas
6. Crear documentación Swagger para cada API
7. Configurar Docker para cada microservicio
