# Microservices Database Alignment

## Legacy Architecture vs. New Architecture
Anteriormente, el proyecto utilizaba una base de datos única (`erp_main_db`) separada lógicamente mediante "esquemas" (schemas) de PostgreSQL (`shared`, `empresas_catalogos`, `inventarios`, etc.). 

Si bien esto facilitaba la administración de la infraestructura, viola el principio estricto de microservicios: **"Base de datos por servicio"**. Para asegurar la autonomía, el escalamiento independiente, y evitar el acoplamiento directo por llaves foráneas, hemos migrado a bases de datos completamente independientes.

## Database Assignments

1. **Company Service** -> `company_db` (Tablas: companies, branches, cities)
2. **Auth Service** -> `auth_db` (Tablas: users, roles, permissions)
3. **Product Service** -> `product_db` (Tablas: products, categories, brands)
4. **Inventory Service** -> `inventory_db` (Tablas: inventory_stock, inventory_transfers, kardex, etc.)
5. **Sales Service** -> `sales_db` (Tablas: sales, sale_details, payments, receipts)
6. **Customer Service** -> `customer_db` (Tablas: customers, loyalty_accounts, discounts)
7. **Notification Service** -> `notification_db` (Tablas: notifications, templates, consumed_events)

## Integration Patterns

- **No Foreign Keys:** No hay FKs cruzadas. Inventory Service guarda el `product_id` (UUID), pero no es una FK estricta en su base de datos.
- **Snapshots:** Sales e Inventory guardan un "snapshot" de información que puede cambiar en el tiempo, como `product_name_snapshot` o `unit_price_snapshot`. Esto previene que un cambio de nombre o precio altere el historial de recibos e inventario.
- **REST APIs:** Para consultas puntuales o en vivo, Sales o Inventory consumirán el API de Product Service.
- **Event Driven (RabbitMQ):** 
  - `ProductCreated` o `ProductUpdated`: Inventory puede reaccionar para preparar registros.
  - `SaleCompleted`: Inventory reduce stock disponible, y Notification Service envía un email al cliente.
  - `StockLow`: Inventory emite alerta, Notification la envía.

## Responsibility Split
- **DBB (Database & Backend Infrastructure):** Configura las bases, crea la estructura inicial (schemas, views, functions transaccionales complejas de DB), asegura semillas (seeds) para datos de prueba iniciales.
- **Backend Developer:** Desarrolla los endpoints, conecta Prisma/TypeORM/Hibernate a su DB específica y publica/consume eventos RabbitMQ.
