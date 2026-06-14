# Base de Datos - Tiendas Sucursales ERP

Este directorio contiene la estructura, datos iniciales, vistas, funciones y verificaciones técnicas de la base de datos del sistema multicompañía y multisucursal.

La base está preparada para ser consumida por los microservicios del proyecto, principalmente por los módulos de empresas, catálogos, inventarios, ventas, compras y finanzas.

## 1. Motor de base de datos

La base de datos se levanta mediante Docker usando PostgreSQL.

Datos de conexión local:

```text
Servicio Docker: postgres
Base de datos: erp_main_db
Usuario: admin
Contraseña: erp_secure_password_2024
Puerto local: 5432
```

Cadena de conexión local:

```text
postgresql://admin:erp_secure_password_2024@localhost:5432/erp_main_db
```

Cadena de conexión para microservicios dentro de Docker:

```text
postgresql://admin:erp_secure_password_2024@postgres:5432/erp_main_db
```

## 2. Estructura de carpetas

```text
database/
├── init/
│   ├── 01-create-schemas.sql
│   ├── 02-create-empresas-catalogos.sql
│   ├── 03-create-inventarios.sql
│   ├── 04-create-inventory-views.sql
│   └── 05-create-transfer-functions.sql
├── seed/
│   └── 01-seed-demo-base.sql
├── checks/
│   └── 01-check-database-health.sql
└── docs/
    └── README_DATABASE.md
```

## 3. Esquemas creados

La base trabaja con esquemas separados para simular una arquitectura por microservicios:

```text
shared
empresas_catalogos
inventarios
ventas_facturacion
finanzas
```

## 4. Tablas principales

### 4.1. Esquema empresas_catalogos

```text
companias
sucursales
almacenes
cajas
empleados
clientes
proveedores
```

Este esquema administra la información base del sistema multicompañía y multisucursal.

### 4.2. Esquema inventarios

```text
productos
stock_almacen
transferencias_stock
transferencia_detalles
movimientos_inventario
producto_series
```

Este esquema administra productos, stock por almacén, transferencias entre sucursales, movimientos de inventario y productos con número de serie.

## 5. Vistas disponibles

Las vistas permiten consultar información de manera simple sin escribir consultas extensas.

```text
inventarios.v_stock_por_sucursal
inventarios.v_transferencias_detalladas
inventarios.v_kardex_inventario
```

### Vista de stock por sucursal

```sql
SELECT
    sucursal,
    producto,
    cantidad_disponible,
    stock_minimo,
    estado_stock
FROM inventarios.v_stock_por_sucursal
ORDER BY producto, sucursal;
```

### Vista de transferencias detalladas

```sql
SELECT
    transferencia_id,
    sucursal_origen,
    sucursal_destino,
    estado,
    producto,
    cantidad,
    fecha_envio,
    fecha_recepcion
FROM inventarios.v_transferencias_detalladas
ORDER BY fecha_envio DESC;
```

### Vista de kardex de inventario

```sql
SELECT
    sucursal,
    producto,
    tipo_movimiento,
    cantidad,
    referencia_tipo,
    referencia_id,
    fecha_movimiento
FROM inventarios.v_kardex_inventario
ORDER BY fecha_movimiento DESC;
```

## 6. Funciones de inventario

La base incluye funciones transaccionales para manejar transferencias de stock.

```text
inventarios.despachar_transferencia(...)
inventarios.recibir_transferencia(...)
```

### Despachar transferencia

La función `despachar_transferencia` realiza las siguientes acciones:

```text
1. Valida que la cantidad sea mayor a cero.
2. Valida que el almacén origen y destino no sean el mismo.
3. Bloquea la fila de stock origen con SELECT FOR UPDATE.
4. Verifica que exista stock suficiente.
5. Crea la transferencia en estado EN_TRANSITO.
6. Crea el detalle de la transferencia.
7. Descuenta el stock del almacén origen.
8. Registra el movimiento TRANSFERENCIA_SALIDA en el kardex.
```

### Recibir transferencia

La función `recibir_transferencia` realiza las siguientes acciones:

```text
1. Valida que la transferencia exista.
2. Valida que esté en estado EN_TRANSITO.
3. Suma el stock en el almacén destino.
4. Cambia la transferencia a estado COMPLETADA.
5. Registra el movimiento TRANSFERENCIA_ENTRADA en el kardex.
```

## 7. Levantar servicios con Docker

Desde la raíz del proyecto ejecutar:

```powershell
docker compose up -d postgres rabbitmq
```

Verificar contenedores:

```powershell
docker compose ps
```

## 8. Ejecutar scripts de estructura

Ejecutar los scripts en este orden:

```powershell
Get-Content -Raw database\init\01-create-schemas.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Get-Content -Raw database\init\02-create-empresas-catalogos.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Get-Content -Raw database\init\03-create-inventarios.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Get-Content -Raw database\init\04-create-inventory-views.sql | docker compose exec -T postgres psql -U admin -d erp_main_db

Get-Content -Raw database\init\05-create-transfer-functions.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
```

## 9. Cargar datos demo

```powershell
Get-Content -Raw database\seed\01-seed-demo-base.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
```

Los datos demo incluyen:

```text
1 compañía demo
3 sucursales: La Paz, Cochabamba y Santa Cruz
3 almacenes principales
2 cajas
2 empleados demo
4 productos
Stock inicial por sucursal
Movimientos iniciales en kardex
```

## 10. Verificación técnica de la base

Para verificar que la base está lista para ser consumida:

```powershell
Get-Content -Raw database\checks\01-check-database-health.sql | docker compose exec -T postgres psql -U admin -d erp_main_db
```

Este check valida:

```text
Esquemas disponibles
Tablas principales
Vistas disponibles
Stock actual por sucursal
Funciones de transferencia
Transferencias registradas
Kardex de inventario
```

## 11. Flujo probado de transferencia de stock

Se probó una transferencia de stock entre sucursales:

```text
Origen: Sucursal La Paz
Destino: Sucursal Cochabamba
Producto: Laptop Lenovo ThinkPad
Cantidad transferida: 10
```

Resultado esperado y validado:

```text
Antes:
La Paz: 50 laptops
Cochabamba: 20 laptops
Santa Cruz: 10 laptops

Después del despacho:
La Paz: 40 laptops
Cochabamba: 20 laptops
Transferencia: EN_TRANSITO

Después de la recepción:
La Paz: 40 laptops
Cochabamba: 30 laptops
Transferencia: COMPLETADA
```

El kardex registra:

```text
TRANSFERENCIA_SALIDA desde La Paz
TRANSFERENCIA_ENTRADA hacia Cochabamba
```

## 12. Validación de stock insuficiente

También se validó que la base no permite transferir más stock del disponible.

Ejemplo:

```text
La Paz tiene 40 laptops.
Se intenta transferir 999 laptops.
Resultado: ERROR por stock insuficiente.
El stock no cambia.
```

Esto demuestra que la base mantiene consistencia y evita stock negativo.

## 13. Estado actual

La base de datos cuenta con:

```text
Estructura inicial por esquemas
Tablas base de empresas y catálogos
Tablas de inventario
Datos semilla
Vistas de consulta
Funciones transaccionales
Verificación técnica
Flujo de transferencia validado
```

La base queda lista para ser utilizada por los microservicios del proyecto.

