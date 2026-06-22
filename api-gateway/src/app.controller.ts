import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'admin',
  password: 'erp_secure_password_2024',
  host: 'localhost',
  port: 15432,
  database: 'supermarket_mvp_db',
});

const notifications: any[] = [];

function cleanText(value: any): string {
  return String(value ?? '').trim();
}

function isPositiveNumber(value: any): boolean {
  const n = Number(value);
  return !Number.isNaN(n) && n > 0;
}

function isNonNegativeNumber(value: any): boolean {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 0;
}

function isPositiveInteger(value: any): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

function isNonNegativeInteger(value: any): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0;
}

function calculateSalePrice(body: any): number {
  const purchasePrice = Number(body.purchase_price);
  const marginPercent = Number(body.margin_percent);
  const manualSalePrice = Number(body.sale_price);

  if (!Number.isNaN(purchasePrice) && !Number.isNaN(marginPercent) && purchasePrice > 0 && marginPercent >= 0) {
    return Number((purchasePrice * (1 + marginPercent / 100)).toFixed(2));
  }

  return Number(manualSalePrice);
}

@Controller()
export class AppController {
  @Get('api/companies')
  async getCompanies() {
    const result = await pool.query('SELECT * FROM companies ORDER BY name');
    return result.rows;
  }

  @Post('api/companies')
  async createCompany(@Body() body: any) {
    const id = cleanText(body.id);
    const name = cleanText(body.name);
    const nit = cleanText(body.nit);

    if (!id || !name || !nit) {
      throw new HttpException('Debe enviar id, name y nit', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      'INSERT INTO companies (id, name, nit) VALUES ($1, $2, $3) RETURNING *',
      [id, name, nit],
    );

    return result.rows[0];
  }

  @Get('api/branches')
  async getBranches() {
    const result = await pool.query(`
      SELECT b.id, b.name, b.city, b.company_id, c.name AS company_name
      FROM branches b
      INNER JOIN companies c ON c.id = b.company_id
      ORDER BY c.name, b.name
    `);

    return result.rows;
  }

  @Post('api/branches')
  async createBranch(@Body() body: any) {
    const id = cleanText(body.id);
    const name = cleanText(body.name);
    const company_id = cleanText(body.company_id);
    const city = cleanText(body.city);

    if (!id || !name || !company_id || !city) {
      throw new HttpException('Debe enviar id, name, company_id y city', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      'INSERT INTO branches (id, name, company_id, city) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, company_id, city],
    );

    return result.rows[0];
  }

  @Get('api/products')
  async getProducts() {
    const result = await pool.query(`
      SELECT id, code, name, category, brand, unit, sale_price, status, created_at
      FROM products
      ORDER BY code
    `);

    return result.rows;
  }

  @Post('api/products')
  async createProduct(@Body() body: any) {
    const id = cleanText(body.id);
    const code = cleanText(body.code);
    const name = cleanText(body.name);
    const category = cleanText(body.category);
    const brand = cleanText(body.brand);
    const unit = cleanText(body.unit);
    const sale_price = calculateSalePrice(body);

    if (!id || !code || !name || !category || !brand || !unit) {
      throw new HttpException('Debe enviar id, code, name, category, brand y unit', HttpStatus.BAD_REQUEST);
    }

    if (!isPositiveNumber(sale_price)) {
      throw new HttpException('El precio debe ser mayor a 0', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      `
      INSERT INTO products (id, code, name, category, brand, unit, sale_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      RETURNING *
      `,
      [id, code, name, category, brand, unit, sale_price],
    );

    notifications.unshift({
      id: Date.now().toString(),
      type: 'ProductCreated',
      title: 'Producto Creado',
      message: `Producto ${name} registrado correctamente`,
      createdAt: new Date().toISOString(),
    });

    return result.rows[0];
  }

  @Put('api/products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const code = cleanText(body.code);
    const name = cleanText(body.name);
    const category = cleanText(body.category);
    const brand = cleanText(body.brand);
    const unit = cleanText(body.unit);
    const sale_price = calculateSalePrice(body);

    if (!code || !name || !category || !brand || !unit) {
      throw new HttpException('Debe enviar code, name, category, brand y unit', HttpStatus.BAD_REQUEST);
    }

    if (!isPositiveNumber(sale_price)) {
      throw new HttpException('El precio debe ser mayor a 0', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      `
      UPDATE products
      SET code = $1, name = $2, category = $3, brand = $4, unit = $5, sale_price = $6
      WHERE id = $7
      RETURNING *
      `,
      [code, name, category, brand, unit, sale_price, id],
    );

    if (result.rowCount === 0) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    notifications.unshift({
      id: Date.now().toString(),
      type: 'ProductUpdated',
      title: 'Producto Actualizado',
      message: `Producto ${name} actualizado correctamente`,
      createdAt: new Date().toISOString(),
    });

    return result.rows[0];
  }

  @Put('api/products/:id/status')
  async updateProductStatus(@Param('id') id: string, @Body() body: any) {
    const status = cleanText(body.status);

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      throw new HttpException('Estado inválido', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      `
      UPDATE products
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id],
    );

    if (result.rowCount === 0) {
      throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
    }

    return result.rows[0];
  }

  @Get('api/categories')
  async getCategories() {
    const result = await pool.query(`
      SELECT DISTINCT category
      FROM products
      WHERE category IS NOT NULL AND category <> ''
      ORDER BY category
    `);

    return result.rows;
  }

  @Get('api/inventory')
  async getInventory() {
    const result = await pool.query(`
      SELECT 
        s.branch_id,
        s.product_id,
        c.name AS company_name,
        b.name AS branch_name,
        b.city,
        p.code AS product_code,
        p.name AS product_name,
        s.quantity,
        s.min_stock,
        CASE
          WHEN s.quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN s.quantity < s.min_stock THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM inventory_stock s
      INNER JOIN branches b ON b.id = s.branch_id
      INNER JOIN companies c ON c.id = b.company_id
      INNER JOIN products p ON p.id = s.product_id
      ORDER BY c.name, b.name, p.code
    `);

    return result.rows;
  }

  @Get('api/inventory/kardex/:branchId/:productId')
  async getKardex(
    @Param('branchId') branchId: string,
    @Param('productId') productId: string,
  ) {
    const result = await pool.query(
      `
      SELECT
        m.id,
        m.branch_id,
        m.product_id,
        c.name AS company_name,
        b.name AS branch_name,
        b.city,
        p.code AS product_code,
        p.name AS product_name,
        m.movement_type,
        m.quantity_change,
        m.balance_after,
        m.notes,
        m.created_at
      FROM inventory_movements m
      INNER JOIN branches b ON b.id = m.branch_id
      INNER JOIN companies c ON c.id = b.company_id
      INNER JOIN products p ON p.id = m.product_id
      WHERE m.branch_id = $1
        AND m.product_id = $2
      ORDER BY m.created_at DESC
      LIMIT 50
      `,
      [branchId, productId],
    );

    return result.rows;
  }

  @Post('api/inventory/load')
  async loadInventory(@Body() body: any) {
    const branch_id = cleanText(body.branch_id);
    const product_id = cleanText(body.product_id);
    const initial_stock = Number(body.initial_stock);
    const target_min_stock = Number(body.target_min_stock);

    if (!branch_id || !product_id) {
      throw new HttpException('Debe enviar branch_id y product_id', HttpStatus.BAD_REQUEST);
    }

    if (!isNonNegativeInteger(initial_stock) || !isNonNegativeInteger(target_min_stock)) {
      throw new HttpException(
        'El stock inicial y el stock mínimo deben ser números enteros no negativos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await pool.query(
      `
      INSERT INTO inventory_stock (branch_id, product_id, quantity, min_stock)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (branch_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity, min_stock = EXCLUDED.min_stock
      RETURNING *
      `,
      [branch_id, product_id, initial_stock, target_min_stock],
    );

    await pool.query(
      `
      INSERT INTO inventory_movements 
        (branch_id, product_id, movement_type, quantity_change, balance_after, notes)
      VALUES ($1, $2, 'IN', $3, $3, 'Carga manual de inventario')
      `,
      [branch_id, product_id, initial_stock],
    );

    return {
      success: true,
      message: 'Inventario cargado correctamente',
      inventory: result.rows[0],
    };
  }

  @Post('api/inventory/output')
  async outputInventory(@Body() body: any) {
    const branch_id = cleanText(body.branch_id);
    const product_id = cleanText(body.product_id);
    const quantity = Number(body.quantity);
    const reason = cleanText(body.reason) || 'Baja por pérdida o vencimiento';

    if (!branch_id || !product_id) {
      throw new HttpException('Debe enviar branch_id y product_id', HttpStatus.BAD_REQUEST);
    }

    if (!isPositiveInteger(quantity)) {
      throw new HttpException('La cantidad de baja debe ser un número entero mayor a 0', HttpStatus.BAD_REQUEST);
    }

    const current = await pool.query(
      `
      SELECT quantity, min_stock
      FROM inventory_stock
      WHERE branch_id = $1 AND product_id = $2
      `,
      [branch_id, product_id],
    );

    if (current.rowCount === 0) {
      throw new HttpException('No existe stock para este producto en la sucursal seleccionada', HttpStatus.BAD_REQUEST);
    }

    const currentQty = Number(current.rows[0].quantity) || 0;

    if (quantity > currentQty) {
      throw new HttpException(`Stock insuficiente. Disponible: ${currentQty}`, HttpStatus.BAD_REQUEST);
    }

    const newBalance = currentQty - quantity;

    const result = await pool.query(
      `
      UPDATE inventory_stock
      SET quantity = $1
      WHERE branch_id = $2 AND product_id = $3
      RETURNING *
      `,
      [newBalance, branch_id, product_id],
    );

    await pool.query(
      `
      INSERT INTO inventory_movements 
        (branch_id, product_id, movement_type, quantity_change, balance_after, notes)
      VALUES ($1, $2, 'OUT', $3, $4, $5)
      `,
      [branch_id, product_id, quantity * -1, newBalance, reason],
    );

    return {
      success: true,
      message: 'Baja registrada correctamente',
      inventory: result.rows[0],
    };
  }

  @Post('api/inventory/input')
  async inputInventory(@Body() body: any) {
    const branch_id = cleanText(body.branch_id);
    const product_id = cleanText(body.product_id);
    const quantity = Number(body.quantity);
    const reason = cleanText(body.reason) || 'Reabastecimiento';

    if (!branch_id || !product_id) {
      throw new HttpException('Debe enviar branch_id y product_id', HttpStatus.BAD_REQUEST);
    }

    if (!isPositiveInteger(quantity)) {
      throw new HttpException('La cantidad debe ser un número entero mayor a 0', HttpStatus.BAD_REQUEST);
    }

    const current = await pool.query(
      `
      SELECT quantity
      FROM inventory_stock
      WHERE branch_id = $1
        AND product_id = $2
      `,
      [branch_id, product_id],
    );

    if (current.rowCount === 0) {
      throw new HttpException('No existe inventario para ese producto', HttpStatus.BAD_REQUEST);
    }

    const currentQty = Number(current.rows[0].quantity) || 0;
    const newBalance = currentQty + quantity;

    const result = await pool.query(
      `
      UPDATE inventory_stock
      SET quantity = $1
      WHERE branch_id = $2
        AND product_id = $3
      RETURNING *
      `,
      [newBalance, branch_id, product_id],
    );

    await pool.query(
      `
      INSERT INTO inventory_movements
        (branch_id, product_id, movement_type, quantity_change, balance_after, notes)
      VALUES ($1, $2, 'IN', $3, $4, $5)
      `,
      [branch_id, product_id, quantity, newBalance, reason],
    );

    return {
      success: true,
      message: 'Stock reabastecido correctamente',
      inventory: result.rows[0],
    };
  }

  @Post('api/sales')
  async createSale(@Body() body: any) {
    const branch_id = cleanText(body.branch_id);
    const customer_id = cleanText(body.customer_id) || null;
    const user_id = cleanText(body.user_id) || null;
    const { items } = body;

    if (!branch_id) {
      throw new HttpException('Debe enviar branch_id', HttpStatus.BAD_REQUEST);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpException('Debe enviar al menos un producto en la venta', HttpStatus.BAD_REQUEST);
    }

    for (const item of items) {
      if (!cleanText(item.product_id)) {
        throw new HttpException('Cada producto debe tener product_id', HttpStatus.BAD_REQUEST);
      }

      if (!isPositiveInteger(item.quantity)) {
        throw new HttpException(
          'Las cantidades de venta deben ser números enteros mayores a 0',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!isPositiveNumber(item.unit_price)) {
        throw new HttpException('El precio unitario debe ser mayor a 0', HttpStatus.BAD_REQUEST);
      }
    }

    const itemsJson = JSON.stringify(items);

    try {
      const result = await pool.query(
        'SELECT * FROM fn_register_sale($1, $2, $3, $4::jsonb)',
        [branch_id, customer_id, user_id, itemsJson],
      );

      notifications.unshift({
        id: Date.now().toString(),
        type: 'SaleCompleted',
        title: 'Venta Completada',
        message: `Venta registrada en ${branch_id}`,
        createdAt: new Date().toISOString(),
      });

      return { success: true, sale: result.rows[0] };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('api/inventory/transfer')
  async transferStock(@Body() body: any) {
    const product_id = cleanText(body.product_id);
    const source_branch = cleanText(body.source_branch);
    const dest_branch = cleanText(body.dest_branch);
    const quantity = Number(body.quantity);
    const user_id = cleanText(body.user_id) || null;

    if (!product_id || !source_branch || !dest_branch) {
      throw new HttpException(
        'Debe enviar product_id, source_branch y dest_branch',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (source_branch === dest_branch) {
      throw new HttpException(
        'La sucursal origen y destino deben ser distintas',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!isPositiveInteger(quantity)) {
      throw new HttpException(
        'La cantidad de transferencia debe ser un número entero mayor a 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await pool.query(
        'SELECT * FROM fn_transfer_stock($1, $2, $3, $4, $5)',
        [product_id, source_branch, dest_branch, quantity, user_id],
      );

      return { success: true, transfer: result.rows[0] };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('api/reports/stock')
  async getStockReport() {
    const result = await pool.query('SELECT * FROM v_inventory_consolidated');
    return result.rows;
  }

  @Get('api/reports/sales-day')
  async getSalesDayReport() {
    const result = await pool.query('SELECT * FROM v_sales_daily_report');
    return result.rows;
  }

  @Get('api/notifications')
  getNotifications() {
    return notifications.slice(0, 10);
  }
}