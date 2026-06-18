import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'admin',
  password: 'erp_secure_password_2024',
  host: 'localhost',
  port: 5432,
  database: 'supermarket_mvp_db',
});

// A temporary array to simulate notifications that might be created by DB triggers/events
const notifications: any[] = [];

@Controller()
export class AppController {

  @Get('api/companies')
  async getCompanies() {
    const result = await pool.query('SELECT * FROM companies');
    return result.rows;
  }

  @Post('api/companies')
  async createCompany(@Body() body: any) {
    const { id, name, nit, address, phone, email } = body;
    const result = await pool.query(
      'INSERT INTO companies (id, name, nit, address, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, nit, address, phone, email]
    );
    return result.rows[0];
  }

  @Get('api/branches')
  async getBranches() {
    const result = await pool.query('SELECT * FROM branches');
    return result.rows;
  }

  @Post('api/branches')
  async createBranch(@Body() body: any) {
    const { id, name, company_id, address, phone, manager } = body;
    const result = await pool.query(
      'INSERT INTO branches (id, name, company_id, address, phone, manager) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, company_id, address, phone, manager]
    );
    return result.rows[0];
  }

  @Get('api/products')
  async getProducts() {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
  }

  @Post('api/products')
  async createProduct(@Body() body: any) {
    const { id, name, description, category, price } = body;
    const result = await pool.query(
      'INSERT INTO products (id, name, description, category, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, description, category, price]
    );
    return result.rows[0];
  }

  @Get('api/inventory')
  async getInventory() {
    const result = await pool.query('SELECT * FROM v_inventory_by_branch');
    return result.rows;
  }

  @Post('api/inventory/load')
  async loadInventory(@Body() body: any) {
    const { branch_id, product_id, initial_stock, max_stock, target_min_stock } = body;
    const result = await pool.query(
      'INSERT INTO inventory_stock (branch_id, product_id, stock_quantity, max_capacity, target_min_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [branch_id, product_id, initial_stock, max_stock, target_min_stock]
    );
    notifications.unshift({
      id: Date.now().toString(),
      type: 'InventoryLoad',
      title: 'Inventario Cargado',
      message: `Se cargaron ${initial_stock} uds en ${branch_id}`,
      createdAt: new Date().toISOString(),
    });
    return result.rows[0];
  }

  @Post('api/sales')
  async createSale(@Body() body: any) {
    // Expected body: { branch_id, customer_id, user_id, items: [{product_id, quantity, unit_price, tax_rate}] }
    // Using simple logic or db functions
    const { branch_id, customer_id, user_id, items, payment_method } = body;
    
    // In MVP, we have a function fn_register_sale(p_branch_id, p_customer_id, p_user_id, p_items jsonb)
    const itemsJson = JSON.stringify(items);
    try {
      const result = await pool.query(
        'SELECT * FROM fn_register_sale($1, $2, $3, $4::jsonb)',
        [branch_id, customer_id || 'CUST-001', user_id || 'EMP-001', itemsJson]
      );
      notifications.unshift({
        id: Date.now().toString(),
        type: 'SaleCompleted',
        title: 'Venta Completada',
        message: `Venta registrada en ${branch_id}`,
        createdAt: new Date().toISOString(),
      });
      return { success: true, sale: result.rows[0] };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('api/inventory/transfer')
  async transferStock(@Body() body: any) {
    const { product_id, source_branch, dest_branch, quantity, user_id } = body;
    try {
      const result = await pool.query(
        'SELECT * FROM fn_transfer_stock($1, $2, $3, $4, $5)',
        [product_id, source_branch, dest_branch, quantity, user_id || 'EMP-001']
      );
      notifications.unshift({
        id: Date.now().toString(),
        type: 'TransferCompleted',
        title: 'Transferencia Completada',
        message: `Se transfirieron ${quantity} uds de ${source_branch} a ${dest_branch}`,
        createdAt: new Date().toISOString(),
      });
      return { success: true, transfer: result.rows[0] };
    } catch (e) {
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
