import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
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

  // --- COMPANIES ---
  @Get('api/companies')
  async getCompanies() {
    const result = await pool.query('SELECT * FROM companies');
    return result.rows;
  }

  @Post('api/companies')
  async createCompany(@Body() body: any) {
    const { id, name, nit, status } = body;
    const result = await pool.query(
      'INSERT INTO companies (id, name, nit, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, nit, status || 'active']
    );
    return result.rows[0];
  }

  @Put('api/companies/:id')
  async updateCompany(@Param('id') id: string, @Body() body: any) {
    const { name, nit, status } = body;
    const result = await pool.query(
      'UPDATE companies SET name = $1, nit = $2, status = $3 WHERE id = $4 RETURNING *',
      [name, nit, status, id]
    );
    return result.rows[0];
  }

  @Delete('api/companies/:id')
  async deleteCompany(@Param('id') id: string) {
    try {
      const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
      return { success: true, deleted: result.rows[0] };
    } catch (e: any) {
      // Si la base de datos bloquea el borrado por tener sucursales activas, lanzamos error
      throw new HttpException('No se puede eliminar la empresa porque tiene sucursales asignadas.', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('api/branches/:id')
  async deleteBranch(@Param('id') id: string) {
    const result = await pool.query('DELETE FROM branches WHERE id = $1 RETURNING *', [id]);
    return { success: true, deleted: result.rows[0] };
  }
  
  // --- BRANCHES ---
  @Get('api/branches')
  async getBranches() {
    const result = await pool.query('SELECT * FROM branches');
    return result.rows;
  }

  @Post('api/branches')
  async createBranch(@Body() body: any) {
    const { id, company_id, name, city, address, status } = body;
    const result = await pool.query(
      'INSERT INTO branches (id, company_id, name, city, address, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, company_id, name, city, address, status || 'active']
    );
    return result.rows[0];
  }

  @Put('api/branches/:id')
  async updateBranch(@Param('id') id: string, @Body() body: any) {
    const { company_id, name, city, address, status } = body;
    const result = await pool.query(
      'UPDATE branches SET company_id = $1, name = $2, city = $3, address = $4, status = $5 WHERE id = $6 RETURNING *',
      [company_id, name, city, address, status, id]
    );
    return result.rows[0];
  }

  // --- PRODUCTS ---
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

  // --- INVENTORY ---
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
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // --- SALES ---
  @Post('api/sales')
  async createSale(@Body() body: any) {
    const { branch_id, customer_id, user_id, items, payment_method } = body;
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
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // --- REPORTS & NOTIFICATIONS ---
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