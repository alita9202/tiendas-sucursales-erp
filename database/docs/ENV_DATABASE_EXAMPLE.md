# Variables de Entorno sugeridas para Base de Datos e Infraestructura

Este documento define las variables sugeridas para que los microservicios puedan conectarse a PostgreSQL y RabbitMQ.

Actualmente el repositorio no tiene `.env.example` en cada microservicio backend, por lo que estas variables sirven como referencia para futuras configuraciones.

## PostgreSQL local

Cuando el microservicio se ejecuta directamente en la computadora:

```env
DATABASE_URL=postgresql://admin:erp_secure_password_2024@localhost:5432/erp_main_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=erp_secure_password_2024
DB_NAME=erp_main_db