# Database Consumption Guide for Backend Developers

## Connecting to your Database
Cada microservicio debe conectarse ÚNICAMENTE a su base de datos asignada. Revisa `ENV_DATABASE_EXAMPLE.md` para las variables de entorno. 
No intentes conectar el Inventory Service a `product_db`. Eso rompe la arquitectura.

## Allowed and Forbidden Actions
- **SI:** Consume tablas que pertenecen a tu DB.
- **SI:** Ejecuta las vistas predefinidas. Ejemplo, en Inventory: `SELECT * FROM v_inventory_balance`.
- **SI:** Llama a funciones/stored procedures. Ejemplo, en Inventory: `SELECT process_inventory_transfer_dispatch('uuid')`.
- **NO:** No intentes hacer JOIN con tablas de otro microservicio. Si necesitas información combinada, haz fetch por REST o consolida vistas en un API Gateway/BFF.

## Endpoints Expected by the Practice
- **Inventory Service:** Debe proveer un POST `/inventory/loadExcel` para carga masiva. Se ha dejado una tabla lista `inventory_excel_imports`. El archivo de prueba está en `database/samples/inventory-load-sample.csv`. El Backend es responsable de parsearlo e insertar en stock.
- **Sales Service:** Debe proveer POST `/sales`. Al terminar, debe publicar el evento `SaleCompleted` a RabbitMQ.

## Checking Initial Data
Puedes ejecutar el script `\database\scripts\check-service-databases.ps1` para validar que todos los servicios tienen data semilla disponible. 
Existen más de 30 productos y clientes de demo para facilitar el testing.
