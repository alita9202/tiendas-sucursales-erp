# Environment Variables for Databases

Variables que cada microservicio debe implementar en su `.env` dependiendo de su stack.

## Localhost Setup (Run locally, connect to Docker DB)

```env
COMPANY_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/company_db
AUTH_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/auth_db
PRODUCT_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/product_db
INVENTORY_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/inventory_db
SALES_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/sales_db
CUSTOMER_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/customer_db
NOTIFICATION_DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/notification_db

RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

## Docker Internal Setup (Run app in Docker, connect to Docker DB)
Usa el hostname del contenedor `erp-postgres` y `erp-rabbitmq`.

```env
COMPANY_DATABASE_URL=postgresql://admin:erp_secure_password_2024@erp-postgres:5432/company_db
AUTH_DATABASE_URL=postgresql://admin:erp_secure_password_2024@erp-postgres:5432/auth_db
# ... y así sucesivamente

RABBITMQ_URL=amqp://guest:guest@erp-rabbitmq:5672/
```