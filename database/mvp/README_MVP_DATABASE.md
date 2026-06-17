# DocumentaciA³n MVP de Base de Datos

Esta carpeta contiene la definiciA³n de una **Base de Datos Simplificada y Centralizada (MVP)** para el proyecto de microservicios.

## PropA³sito
El objetivo es proveer un entorno funcional, libre de fricciones de configuraciA³n, para facilitar la conexiA³n rA¡pida entre los equipos de Frontend y Backend, cumpliendo estrictamente con los casos de uso definidos para la demostraciA³n acadA©mica.

Se ha consolidado el esquema en una sola base `supermarket_mvp_db`, descartando arquitecturas sobre-diseA±adas (como un microservicio o DB separada por entidad) que complicaban la implementaciA³n.

## Archivos
- `00-create-database.sql`: Crea la base si no existe.
- `01-schema.sql`: Define las tablas requeridas.
- `02-seed-demo.sql`: Inserta los datos iniciales obligatorios.
- `03-views.sql`: Vistas para reportes rA¡pidos (kardex y ventas).
- `04-functions.sql`: LA³gica de transacciones (ventas, transferencias, bajas).

## EjecuciA³n Automatizada
Utiliza los scripts ubicados en `database/scripts/`:

```powershell
# Levantar el entorno de Docker (postgres y rabbitmq si es necesario)
docker compose up -d postgres

# Reiniciar y poblar la base de datos MVP
.\database\scripts\reset-mvp-database.ps1

# Validar que toda la estructura existe y estA¡ correcta
.\database\scripts\check-mvp-database.ps1

# Ejecutar el demo interactivo automA¡tico
.\database\scripts\run-mvp-demo.ps1
```



