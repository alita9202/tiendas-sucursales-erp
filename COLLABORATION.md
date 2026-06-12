# 👥 Guía de Colaboración en Equipo

## 🌳 Estrategia Git - Flujo de Trabajo

Este proyecto usa **Git Flow** para colaboración ordenada.

### Ramas Principales

```
main (producción)
  ├── develop (integración)
  │   ├── feature/ms-inventarios-crud
  │   ├── feature/ms-ventas-api
  │   ├── bugfix/db-connection
  │   └── ...
```

### 📋 Pasos para Colaborar

#### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/EdsonA8911/tiendas-sucursales-erp.git
cd tiendas-sucursales-erp
```

#### 2️⃣ Crear tu Rama de Trabajo
```bash
# Siempre partir de develop
git checkout develop
git pull origin develop

# Crear rama para tu tarea
git checkout -b feature/tu-nombre-tarea

# Ejemplos reales:
git checkout -b feature/ms-inventarios-create-product
git checkout -b feature/ms-ventas-order-controller
git checkout -b bugfix/database-connection-issue
```

#### 3️⃣ Hacer Cambios Localmente
```bash
# Trabajar en tu rama
npm run dev

# Ver cambios
git status

# Stagear cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Add product creation endpoint in ms-inventarios"
```

#### 4️⃣ Enviar a GitHub
```bash
# Primera vez
git push -u origin feature/tu-nombre-tarea

# Próximas veces
git push origin feature/tu-nombre-tarea
```

#### 5️⃣ Crear Pull Request (PR)
- Ir a https://github.com/EdsonA8911/tiendas-sucursales-erp
- Click en "Compare & pull request"
- Escribir descripción clara
- Asignar revisores
- Merge a `develop` cuando esté aprobado

---

## 🗄️ Manejo de Base de Datos

### Estructura de Esquemas

Cada microservicio tendrá su **schema independiente** en PostgreSQL:

```sql
-- Conexión a BD: postgresql://admin:password@localhost:5432/erp_main_db

-- Esquemas
- public.api_gateway              -- Sistema de autenticación
- public.empresas_catalogos       -- Empresas y catálogos
- public.inventarios              -- Productos y almacenes
- public.ventas_facturacion       -- Órdenes y facturas
- public.finanzas                 -- Contabilidad
```

### Crear tu Base de Datos Local

```bash
# Conectar a PostgreSQL
psql -U admin -h localhost -d erp_main_db

# Ver BD actual
\l

# Crear esquema si necesitas
CREATE SCHEMA inventarios;
CREATE SCHEMA ventas_facturacion;

# Salir
\q
```

### Migraciones (TypeORM/Prisma)

Para cada microservicio que use BD:

```bash
cd ms-inventarios

# Ver migraciones pendientes
npm run typeorm migration:show

# Ejecutar migraciones
npm run typeorm migration:run

# Revertir última migración
npm run typeorm migration:revert

# Crear nueva migración
npm run typeorm migration:create -- src/infrastructure/database/migrations/CreateProductsTable
```

---

## 🧪 Testing y Validación

### Testing Local

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e

# Watch mode (auto-rerun en cambios)
npm run test:watch
```

### Validar que Todo Funciona

```bash
# 1. Verificar servicios
curl http://localhost:3000    # API Gateway
curl http://localhost:3001    # ms-empresas-catalogos
curl http://localhost:3002    # ms-inventarios
curl http://localhost:3003    # ms-ventas-facturacion
curl http://localhost:3004    # ms-finanzas
curl http://localhost:3005    # Dashboard

# 2. Ver logs
docker-compose logs postgres
docker-compose logs rabbitmq

# 3. Conectar a BD
psql -U admin -h localhost -d erp_main_db -c "SELECT version();"
```

---

## 📝 Convenciones de Código

### Commits Semánticos

Usar este formato:

```
feat: Agregar feature nueva
fix: Corregir bug
docs: Cambios en documentación
style: Cambios que no afectan el código (espacios, etc)
refactor: Refactorizar sin cambiar funcionalidad
perf: Mejoras de performance
test: Agregar/actualizar tests
chore: Cambios de configuración
```

Ejemplos:
```bash
git commit -m "feat: Add product validation in ms-inventarios"
git commit -m "fix: Correct database connection timeout"
git commit -m "docs: Update setup instructions"
git commit -m "test: Add unit tests for order creation"
```

### Estructura de Carpetas

Mantener consistencia en arquitectura N-Capas:

```
src/
├── domain/              # Entidades, interfaces, excepciones
│   ├── entities/
│   ├── interfaces/
│   └── exceptions/
├── application/         # Casos de uso, DTOs, servicios
│   ├── dtos/
│   ├── services/
│   └── use-cases/
├── infrastructure/      # Persistencia, adaptadores externos
│   ├── database/
│   ├── repositories/
│   └── adapters/
└── presentation/        # Controladores, guardias
    ├── controllers/
    ├── guards/
    └── middleware/
```

---

## 🔄 Flujo de Revisión

1. **Push a tu rama**
   ```bash
   git push origin feature/tu-tarea
   ```

2. **Crear PR en GitHub**
   - Título claro
   - Descripción del cambio
   - Screenshots si es UI

3. **Esperar revisión**
   - Al menos 1 reviewer
   - CI/CD validará tests

4. **Hacer cambios si se solicitan**
   ```bash
   git add .
   git commit -m "refactor: Address PR review comments"
   git push origin feature/tu-tarea
   ```

5. **Merge a develop**
   - ✅ Aprobado
   - ✅ Tests pasando
   - Mergeado a `develop`

6. **Merge a main (release)**
   - Solo cambios probados
   - Se hace esporádicamente (releases)

---

## 🐛 Resolver Conflictos

Si dos personas editan lo mismo:

```bash
# Ver conflictos
git status

# Abrir archivo y resolver manualmente
# Buscar: <<<<<<< HEAD, =======, >>>>>>>

# Después de resolver
git add archivo-resuelto.ts
git commit -m "chore: Resolve merge conflicts"
git push origin feature/tu-tarea
```

---

## 📊 Ver Contribuciones

```bash
# Ver log de commits
git log --oneline --graph --all

# Ver quién cambió qué línea
git blame src/app.controller.ts

# Ver diferencias entre ramas
git diff develop..feature/tu-tarea
```

---

## 🚀 Checklist Antes de Push

- [ ] Código funciona localmente
- [ ] Tests pasan: `npm run test`
- [ ] Linter no tiene errores: `npm run lint`
- [ ] `.env` está en `.gitignore` (NO versionado)
- [ ] Commit message es descriptivo
- [ ] PR tiene descripción clara

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo trabajar en develop directamente?**
R: No, siempre crea una rama `feature/` o `bugfix/`

**P: ¿Qué si alguien pusheó cambios en develop?**
R: 
```bash
git fetch origin
git rebase origin/develop
npm install  # si hay cambios en package.json
```

**P: ¿Mi `.env` local se va a sincronizar?**
R: No, está en `.gitignore`. Cada uno tiene su propio `.env`

**P: ¿Cómo sincronizo BD entre compañeros?**
R: Exportar/importar dumps SQL o usar migraciones con TypeORM

---

## 📞 Contacto

Si hay conflictos o preguntas:
1. Revisar este documento
2. Revisar CHANGES.md
3. Preguntar en el grupo

¡Feliz codificación! 🚀
