# ERP Multi-tenant - Arquitectura de Microservicios

Este proyecto es la base de un sistema ERP Multi-tenant diseñado bajo una arquitectura de microservicios, utilizando NestJS y principios de Arquitectura Limpia (N-Capas).

## 🚀 Topología de Infraestructura

El sistema utiliza Docker para gestionar los servicios de infraestructura base:

- **Red**: `erp-network` (Bridge) aislada para comunicación interna.
- **Base de Datos**: PostgreSQL 15 (Persistente vía volúmenes).
- **Broker de Mensajería**: RabbitMQ (Management UI incluida).

### Puertos de Infraestructura
- **PostgreSQL**: `5432`
- **RabbitMQ (Broker)**: `5672`
- **RabbitMQ (Dashboard)**: `15672`

---

## 🛠 Asignación de Puertos - Microservicios

| Servicio | Puerto Propuesto | Descripción |
| :--- | :---: | :--- |
| `api-gateway` | `3000` | Punto de entrada único y validación de JWT. |
| `ms-empresas-catalogos` | `3001` | Gestión de tenants (empresas) y catálogos base. |
| `ms-inventarios` | `3002` | Control de stock, almacenes y movimientos. |
| `ms-ventas-facturacion` | `3003` | Procesamiento de ventas, pedidos y facturas. |
| `ms-finanzas` | `3004` | Contabilidad, cuentas por cobrar/pagar. |
| `dashboard-web` | `3005` | Dashboard Administrativo (React + Vite + Tailwind). |

---

## 🏗 Arquitectura de N-Capas (Clean Architecture)

Cada microservicio debe seguir esta estructura interna dentro de su carpeta `src/`:

1.  **Domain (Core)**: Entidades de negocio, interfaces de repositorios y lógica pura (sin dependencias externas).
2.  **Application**: Casos de uso, servicios de aplicación y DTOs. Coordina la lógica del dominio.
3.  **Infrastructure**: Implementaciones de base de datos (TypeORM/Prisma), adaptadores de RabbitMQ y clientes externos.
4.  **Presentation**: Controladores de NestJS, Gateways de Websockets o resolvers de GraphQL.

---

## 🚦 Pasos Iniciales para Desarrollo

Para comenzar con un nuevo microservicio (ej. `ms-inventarios`):

1.  **Inicialización de NestJS**:
    ```bash
    cd ms-inventarios
    npx -y @nestjs/cli new . --package-manager npm
    ```

2.  **Configuración de Capas**:
    Mueve los archivos generados por NestJS a la carpeta `src/presentation` y crea las carpetas `domain`, `application` e `infrastructure`.

3.  **Variables de Entorno**:
    Copia el archivo `.env.example` de la raíz a la carpeta del microservicio como `.env` y ajusta los valores.

4.  **Levantar Infraestructura**:
    Desde la raíz del proyecto:
    ```bash
    docker-compose up -d
    ```

5.  **Desarrollo del Dashboard**:
    Para ejecutar la aplicación web en desarrollo:
    ```bash
    cd dashboard-web
    npm run dev
    ```

---

## 📎 Notas de Diseño Senior
- **Multi-tenancy**: Se recomienda el enfoque de "Schema per Tenant" o "Discriminator Column" dependiendo del volumen de datos.
- **Comunicación**: Usar RabbitMQ para procesos asíncronos (eventos de dominio) y REST/gRPC para consultas síncronas entre servicios.
- **Shared Library**: Utiliza la carpeta `/ms-shared` para lógica común que no amerita un microservicio propio.
