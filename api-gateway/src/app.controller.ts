import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { Pool } from 'pg';
import * as nodemailer from 'nodemailer';

import { EventEmitter } from 'events';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'erp_secure_password_2024',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'erp_main_db',
});

// --- EVENT BUS & ASYNC NOTIFICATION SERVICE ---
export const eventBus = new EventEmitter();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false para puerto 587
  auth: {
    user: 'alita4774@gmail.com',
    pass: 'stpgupuseoboclkw', 
  },
});

eventBus.on('SaleCompleted', (payload: any) => {
  setTimeout(async () => {
    try {
      console.log(`[Notification Service] Procesando evento asíncrono para Venta: ${payload.receipt_number}`);
      console.log(`[Notification Service] Enviando correo electrónico a cliente: ${payload.customer_name}...`);
      
      const event_type = 'SaleCompleted';
      const content = `Comprobante digital enviado con éxito a: ${payload.customer_name} (${payload.customer_email || 'N/A'}) | Recibo: ${payload.receipt_number}`;
      
      if (payload.customer_email) {
        const itemsHtml = payload.items && payload.items.length > 0 
          ? payload.items.map((i: any) => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Bs ${Number(i.unit_price).toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Bs ${Number(i.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')
          : '<tr><td colspan="4" style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">Sin detalles</td></tr>';

        const mailOptions = {
          from: `"Doña Serafina" <${process.env.SMTP_USER || 'noreply@donaserafina.com'}>`,
          to: payload.customer_email,
          subject: `Factura Digital - ${payload.receipt_number}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f3e8ff; padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d8b4fe;">
                <div>
                  <h1 style="color: #581c87; margin: 0; font-size: 24px;">DOÑA SERAFINA</h1>
                  <p style="color: #6b21a8; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">FACTURA DIGITAL</p>
                </div>
                <div style="text-align: right; background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #374151;"><strong>NIT:</strong> 1020304050</p>
                  <p style="margin: 3px 0 0 0; font-size: 12px; color: #374151;"><strong>N° Factura:</strong> ${payload.receipt_number}</p>
                  <p style="margin: 3px 0 0 0; font-size: 12px; color: #374151;"><strong>Autorización:</strong> 415401900012345</p>
                </div>
              </div>

              <div style="padding: 20px; background-color: #ffffff;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="padding-bottom: 5px; color: #4b5563;"><strong>Fecha de Emisión:</strong> ${new Date().toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 5px; color: #4b5563;"><strong>Cliente:</strong> ${payload.customer_name}</td>
                  </tr>
                  <tr>
                    <td style="color: #4b5563;"><strong>NIT/CI:</strong> ${payload.customer_document || 'S/N'}</td>
                  </tr>
                </table>

                <div style="margin-top: 20px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead style="background-color: #f9fafb;">
                      <tr>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Cant.</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #374151;">Concepto</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">P. Unit.</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #374151;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>

                <div style="margin-top: 20px; text-align: right;">
                  <h2 style="margin: 0; color: #111827; font-size: 20px;">Total a Pagar: Bs ${Number(payload.total || 0).toFixed(2)}</h2>
                </div>

                <div style="background-color: #fdf4ff; padding: 15px; border-radius: 6px; border: 1px solid #fbcfe8; margin-top: 20px; text-align: center;">
                  <p style="margin: 0; color: #86198f; font-size: 14px;"><strong>Puntos Ganados en esta compra:</strong> +${payload.earned_points} pts</p>
                  <p style="margin: 5px 0 0 0; color: #86198f; font-size: 14px;"><strong>Saldo Total Acumulado:</strong> ${payload.total_points || payload.earned_points} pts</p>
                </div>
              </div>

              <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 10px; color: #6b7280; font-weight: bold;">
                  ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO DE ESTE JUEGO DE DATOS SERÁ SANCIONADO DE ACUERDO A LEY.
                </p>
                <p style="margin: 5px 0 0 0; font-size: 10px; color: #9ca3af;">
                  Este es un documento generado automáticamente.
                </p>
              </div>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`[Notification Service] Correo real enviado exitosamente a ${payload.customer_email}`);
        } catch (mailError) {
          console.error("[Notification Service] ERROR DETALLADO DE NODEMAILER:", mailError);
          console.log(`[Notification Service] Simulación de envío completada (Aviso: El envío real por internet falló o no está configurado, continuando con el flujo local)`);
        }
      }

      await pool.query(
        'INSERT INTO notifications (event_type, customer_id, content, status) VALUES ($1, $2, $3, $4)',
        [event_type, payload.customer_id, content, 'SENT']
      );
      console.log(`[Notification Service] Log de notificación persistido en BD exitosamente.`);
    } catch (e) {
      console.error('[Notification Service] Error procesando evento SaleCompleted:', e);
    }
  }, 2000);
});


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

function isSafeText(text: string): boolean {
  if (!text) return true;
  if (/[<>'";`\\]/.test(text)) return false;
  if (text.includes('--')) return false;
  return true;
}

function isValidName(name: string): boolean {
  if (!name || name.trim() === '') return false;
  if (/^\d+$/.test(name)) return false; 
  return isSafeText(name);
}

function isValidNit(nit: string): boolean {
  if (!nit || nit.trim() === '') return false;
  return /^[0-9\-]{4,20}$/.test(nit);
}

function isValidCode(code: string): boolean {
  if (!code || code.trim() === '') return false;
  return /^[a-zA-Z0-9\-_]+$/.test(code);
}

function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return true; // Optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const name = cleanText(body.name);
    const nit = cleanText(body.nit);
    const status = cleanText(body.status) || 'ACTIVE';

    if (!name || !nit) {
      throw new HttpException('Debe enviar name y nit', HttpStatus.BAD_REQUEST);
    }

    if (!isValidName(name) || !isSafeText(status)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    if (!isValidNit(nit)) {
      throw new HttpException('El NIT/CI debe contener solo números.', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      'INSERT INTO companies (name, nit, status) VALUES ($1, $2, $3) RETURNING *',
      [name, nit, status],
    );

    return result.rows[0];
  }

  @Put('api/companies/:id')
  async updateCompany(@Param('id') id: string, @Body() body: any) {
    const name = cleanText(body.name);
    const nit = cleanText(body.nit);
    const status = cleanText(body.status) || 'ACTIVE';

    if (!name || !nit) {
      throw new HttpException('Debe enviar name y nit', HttpStatus.BAD_REQUEST);
    }
    if (!isValidName(name) || !isSafeText(status)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }
    if (!isValidNit(nit)) {
      throw new HttpException('El NIT/CI debe contener solo números.', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      'UPDATE companies SET name = $1, nit = $2, status = $3 WHERE id = $4 RETURNING *',
      [name, nit, status, id]
    );

    if (result.rowCount === 0) {
      throw new HttpException('Empresa no encontrada', HttpStatus.NOT_FOUND);
    }

    return result.rows[0];
  }

  @Delete('api/companies/:id')
  async deleteCompany(@Param('id') id: string) {
    try {
      const branches = await pool.query('SELECT id FROM branches WHERE company_id = $1 LIMIT 1', [id]);
      if (branches.rowCount > 0) {
        throw new HttpException('No se puede eliminar esta empresa porque tiene sucursales, inventario, ventas o movimientos registrados. Puede desactivarla para conservar el historial.', HttpStatus.BAD_REQUEST);
      }

      const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        throw new HttpException('Empresa no encontrada', HttpStatus.NOT_FOUND);
      }
      return { message: 'Empresa eliminada' };
    } catch (error: any) {
      throw new HttpException(error.message || 'Error al eliminar la empresa.', error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('api/branches')
  async getBranches() {
    const result = await pool.query(`
      SELECT b.id, b.name, b.city, b.address, b.company_id, c.name AS company_name
      FROM branches b
      INNER JOIN companies c ON c.id = b.company_id
      ORDER BY c.name, b.name
    `);

    return result.rows;
  }

  @Post('api/branches')
  async createBranch(@Body() body: any) {
    const name = cleanText(body.name);
    const company_id = cleanText(body.company_id || body.companyId);
    const city = cleanText(body.city);
    const address = cleanText(body.address);
    const status = cleanText(body.status) || 'ACTIVE';

    if (!name || !company_id || !city || !address) {
      throw new HttpException('No se pudo guardar la sucursal. Seleccione una empresa y complete nombre, ciudad y dirección.', HttpStatus.BAD_REQUEST);
    }

    if (!isValidName(name) || !isSafeText(address) || !isSafeText(status)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    if (!isValidName(city)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos en la ciudad.', HttpStatus.BAD_REQUEST);
    }

    const companyExists = await pool.query('SELECT id FROM companies WHERE id = $1', [company_id]);
    if (companyExists.rowCount === 0) {
      throw new HttpException('La empresa seleccionada no existe.', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      'INSERT INTO branches (name, company_id, city, address, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, company_id, city, address, status],
    );

    return result.rows[0];
  }

  @Put('api/branches/:id')
  async updateBranch(@Param('id') id: string, @Body() body: any) {
    const name = cleanText(body.name);
    const city = cleanText(body.city);
    const address = cleanText(body.address);
    const status = cleanText(body.status) || 'ACTIVE';
    const company_id = cleanText(body.company_id || body.companyId);

    if (!name || !city || !address) {
      throw new HttpException('Debe enviar name, city y address', HttpStatus.BAD_REQUEST);
    }

    if (!isValidName(name) || !isValidName(city) || !isSafeText(address) || !isSafeText(status)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    const result = await pool.query(
      'UPDATE branches SET name = $1, city = $2, address = $3, status = $4, company_id = $5 WHERE id = $6 RETURNING *',
      [name, city, address, status, company_id, id]
    );

    if (result.rowCount === 0) {
      throw new HttpException('Sucursal no encontrada', HttpStatus.NOT_FOUND);
    }

    return result.rows[0];
  }

  @Delete('api/branches/:id')
  async deleteBranch(@Param('id') id: string) {
    try {
      const stock = await pool.query('SELECT branch_id FROM inventory_stock WHERE branch_id = $1 LIMIT 1', [id]);
      const movements = await pool.query('SELECT branch_id FROM inventory_movements WHERE branch_id = $1 LIMIT 1', [id]);
      const sales = await pool.query('SELECT id FROM sales WHERE branch_id = $1 LIMIT 1', [id]);
      
      if (stock.rowCount > 0 || movements.rowCount > 0 || sales.rowCount > 0) {
        throw new HttpException('No se puede eliminar esta sucursal porque tiene inventario, ventas o movimientos registrados. Puede desactivarla para conservar el historial.', HttpStatus.BAD_REQUEST);
      }

      const result = await pool.query('DELETE FROM branches WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        throw new HttpException('Sucursal no encontrada', HttpStatus.NOT_FOUND);
      }
      return { message: 'Sucursal eliminada' };
    } catch (error: any) {
      throw new HttpException(error.message || 'Error al eliminar la sucursal.', error.status || HttpStatus.BAD_REQUEST);
    }
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

  @Get('api/products/available')
  async getAvailableProducts(@Query('branch_id') branch_id: string) {
    if (!branch_id) {
      throw new HttpException('Debe enviar branch_id', HttpStatus.BAD_REQUEST);
    }
    const result = await pool.query(`
      SELECT 
        p.id AS product_id,
        p.code AS product_code,
        p.name,
        p.sale_price AS price,
        s.branch_id,
        s.quantity AS stock
      FROM inventory_stock s
      JOIN products p ON p.id = s.product_id
      WHERE s.branch_id = $1
        AND s.quantity > 0
        AND p.status IN ('ACTIVE', 'active')
    `, [branch_id]);

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

    if (!isValidCode(code)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos en el código.', HttpStatus.BAD_REQUEST);
    }

    if (!isValidName(name) || !isSafeText(category) || !isSafeText(brand) || !isSafeText(unit)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
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

    await pool.query(
      'INSERT INTO notifications (event_type, content) VALUES ($1, $2)',
      ['PRODUCT_CREATED', `Producto ${name} registrado correctamente`]
    );

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

    if (!isValidCode(code)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos en el código.', HttpStatus.BAD_REQUEST);
    }

    if (!isValidName(name) || !isSafeText(category) || !isSafeText(brand) || !isSafeText(unit)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
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

    await pool.query(
      'INSERT INTO notifications (event_type, content) VALUES ($1, $2)',
      ['PRODUCT_UPDATED', `Producto ${name} actualizado correctamente`]
    );

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
    const max_stock = Number(body.max_stock);
    const MAX_STOCK_PER_LOT = 10000;

    if (!branch_id || !product_id) {
      throw new HttpException('Debe enviar branch_id y product_id', HttpStatus.BAD_REQUEST);
    }

    if (!isNonNegativeInteger(initial_stock) || !isNonNegativeInteger(target_min_stock)) {
      throw new HttpException(
        'El stock inicial y el stock mínimo deben ser números enteros no negativos',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!Number.isNaN(max_stock) && max_stock > 0 && Number.isInteger(max_stock)) {
      if (initial_stock > max_stock) {
        throw new HttpException('La cantidad inicial no puede superar el stock máximo.', HttpStatus.BAD_REQUEST);
      }
      if (target_min_stock > max_stock) {
        throw new HttpException('El stock mínimo no puede ser mayor al stock máximo.', HttpStatus.BAD_REQUEST);
      }
    }

    if (initial_stock > MAX_STOCK_PER_LOT) {
      throw new HttpException('No se puede registrar el lote. La cantidad supera el límite permitido de inventario.', HttpStatus.BAD_REQUEST);
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
    const notes = cleanText(body.notes) || '';

    if (!branch_id || !product_id) {
      throw new HttpException('Debe enviar branch_id y product_id', HttpStatus.BAD_REQUEST);
    }

    if (!isSafeText(reason) || !isSafeText(notes)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    if (!isPositiveInteger(quantity)) {
      throw new HttpException('La cantidad debe ser un número entero mayor a cero.', HttpStatus.BAD_REQUEST);
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
    const minStock = Number(current.rows[0].min_stock) || 0;

    if (quantity > currentQty) {
      throw new HttpException(`No se puede registrar la baja porque la cantidad supera el stock disponible.`, HttpStatus.BAD_REQUEST);
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
      [branch_id, product_id, quantity * -1, newBalance, reason + (notes ? ' - ' + notes : '')],
    );

    try {
      const names = await pool.query(
        `SELECT p.name as product_name, b.name as branch_name FROM products p CROSS JOIN branches b WHERE p.id = $1 AND b.id = $2`,
        [product_id, branch_id]
      );
      const productName = names.rows[0]?.product_name || 'Producto';
      const branchName = names.rows[0]?.branch_name || 'Sucursal';

      await pool.query(
        `INSERT INTO notifications (event_type, content, status) VALUES ($1, $2, 'PENDING')`,
        ['BAJA_INVENTARIO', `Se registró una baja de ${quantity} unidades de ${productName} en ${branchName}. Motivo: ${reason}.`]
      );

      if (newBalance === 0) {
        await pool.query(
          `INSERT INTO notifications (event_type, content, status) VALUES ($1, $2, 'PENDING')`,
          ['PRODUCTO_AGOTADO', `${productName} en ${branchName} quedó sin stock.`]
        );
      } else if (newBalance <= minStock) {
        await pool.query(
          `INSERT INTO notifications (event_type, content, status) VALUES ($1, $2, 'PENDING')`,
          ['STOCK_BAJO', `${productName} en ${branchName} quedó con stock bajo. Stock actual: ${newBalance}.`]
        );
      }
    } catch (e) {
      console.error('[Notification Service] Error insertando notificaciones de baja:', e);
    }

    return {
      success: true,
      message: 'Baja de inventario registrada correctamente.',
      inventory: result.rows[0],
    };
  }

  @Post('api/inventory/input')
  async inputInventory(@Body() body: any) {
    const branch_id = cleanText(body.branch_id);
    const product_id = cleanText(body.product_id);
    const quantity = Number(body.quantity);
    const reason = cleanText(body.reason) || 'Reabastecimiento';
    const notes = cleanText(body.notes) || '';

    if (!branch_id || !product_id) {
      throw new HttpException('Debe enviar branch_id y product_id', HttpStatus.BAD_REQUEST);
    }

    if (!isSafeText(reason) || !isSafeText(notes)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    if (!isPositiveInteger(quantity)) {
      throw new HttpException('La cantidad debe ser un número entero mayor a cero.', HttpStatus.BAD_REQUEST);
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
    const customer_name = cleanText(body.customer_name) || 'Cliente Final';
    const customer_document = cleanText(body.customer_document) || '0';
    const customer_email = cleanText(body.customer_email);
    const payment_method = cleanText(body.payment_method) || 'Efectivo';
    const { items } = body;

    if (!branch_id) {
      throw new HttpException('No se pudo registrar la venta: branch_id inválido.', HttpStatus.BAD_REQUEST);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpException('No se pudo registrar la venta: el carrito está vacío.', HttpStatus.BAD_REQUEST);
    }

    if (!customer_name || customer_name === '' || !isSafeText(customer_name)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    if (customer_document && customer_document !== '0' && !isValidNit(customer_document)) {
      throw new HttpException('El NIT/CI debe contener solo números.', HttpStatus.BAD_REQUEST);
    }

    if (customer_email && !isValidEmail(customer_email)) {
      throw new HttpException('El correo electrónico ingresado no es válido.', HttpStatus.BAD_REQUEST);
    }

    if (!isSafeText(payment_method)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    for (const item of items) {
      if (!cleanText(item.product_id)) {
        throw new HttpException('No se pudo registrar la venta: producto inválido.', HttpStatus.BAD_REQUEST);
      }

      if (!isPositiveInteger(item.quantity)) {
        throw new HttpException('No se pudo registrar la venta: la cantidad debe ser un número entero mayor a 0.', HttpStatus.BAD_REQUEST);
      }

      if (!isPositiveNumber(item.unit_price)) {
        throw new HttpException('No se pudo registrar la venta: precio unitario inválido.', HttpStatus.BAD_REQUEST);
      }
    }

    try {
      await pool.query('BEGIN');
      
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * item.unit_price;
      }
      
      const earned_points = Math.floor(totalAmount / 10);
      let customerId = null;
      let total_points = earned_points;

      const customerRes = await pool.query('SELECT id, points FROM customers WHERE document_number = $1 LIMIT 1', [customer_document]);
      if (customerRes.rowCount > 0) {
        customerId = customerRes.rows[0].id;
        total_points = customerRes.rows[0].points + earned_points;
        await pool.query('UPDATE customers SET full_name = $1, points = points + $2 WHERE id = $3', [customer_name, earned_points, customerId]);
      } else {
        const newCust = await pool.query('INSERT INTO customers (full_name, document_number, points) VALUES ($1, $2, $3) RETURNING id', [customer_name, customer_document, earned_points]);
        customerId = newCust.rows[0].id;
      }

      const receiptNo = 'REC-' + Date.now().toString() + '-' + Math.floor(Math.random() * 1000);
      
      const saleRes = await pool.query(
        'INSERT INTO sales (branch_id, customer_name, customer_document, receipt_number, payment_method, total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [branch_id, customer_name, customer_document, receiptNo, payment_method, totalAmount]
      );
      const saleId = saleRes.rows[0].id;

      const detailedItems: any[] = [];
      for (const item of items) {
        const prodId = cleanText(item.product_id);
        const qty = item.quantity;
        const price = item.unit_price;
        const subtotal = qty * price;

        const stockRes = await pool.query(
          'SELECT s.quantity, p.name FROM inventory_stock s JOIN products p ON p.id = s.product_id WHERE s.branch_id = $1 AND s.product_id = $2 FOR UPDATE',
          [branch_id, prodId]
        );
        if (stockRes.rowCount === 0) {
          throw new Error(`stock insuficiente para el producto seleccionado.`);
        }
        if (stockRes.rows[0].quantity < qty) {
          throw new Error(`stock insuficiente para ${stockRes.rows[0].name}.`);
        }

        detailedItems.push({
          name: stockRes.rows[0].name,
          quantity: qty,
          unit_price: price,
          subtotal: subtotal
        });

        await pool.query(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
          [saleId, prodId, qty, price, subtotal]
        );

        await pool.query(
          'UPDATE inventory_stock SET quantity = quantity - $1 WHERE branch_id = $2 AND product_id = $3',
          [qty, branch_id, prodId]
        );

        await pool.query(
          'INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, reference_type, reference_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [branch_id, prodId, 'SALE', -qty, stockRes.rows[0].quantity - qty, 'SALE', saleId, 'Venta generada']
        );
      }

      await pool.query('COMMIT');

      // Publicación asíncrona del evento al Notification Service
      eventBus.emit('SaleCompleted', {
        receipt_number: receiptNo,
        customer_name: customer_name,
        customer_id: customerId,
        customer_document: customer_document,
        customer_email: customer_email,
        earned_points: earned_points,
        total: totalAmount,
        total_points: total_points,
        items: detailedItems
      });

      return { success: true, sale: { id: saleId, receipt_number: receiptNo, total_amount: totalAmount, earned_points, total_points } };
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error("ERROR CREATE SALE:", e);
      throw new HttpException({
        message: "No se pudo registrar la venta.",
        detail: e.message
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('api/sales')
  async getSales(@Query('branch_id') branchId?: string) {
    let query = `
      SELECT
        s.id,
        s.receipt_number,
        s.customer_name,
        s.customer_document,
        s.payment_method,
        s.total,
        s.status,
        s.created_at,
        b.id AS branch_id,
        b.name AS branch_name,
        c.name AS company_name
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      LEFT JOIN companies c ON c.id = b.company_id
    `;
    const params: any[] = [];
    if (branchId) {
      query += ` WHERE s.branch_id = $1`;
      params.push(branchId);
    }
    query += ` ORDER BY s.created_at DESC LIMIT 100`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  @Get('api/sales/:id/receipt')
  async getReceipt(@Param('id') id: string) {
    const result = await pool.query(`
      SELECT
        s.id,
        s.receipt_number,
        s.customer_name,
        s.customer_document,
        s.payment_method,
        s.total,
        s.status,
        s.created_at,
        b.name AS branch_name,
        c.name AS company_name
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      LEFT JOIN companies c ON c.id = b.company_id
      WHERE s.id = $1
    `, [id]);

    if (result.rowCount === 0) {
      throw new HttpException('Recibo no encontrado', HttpStatus.NOT_FOUND);
    }

    const itemsRes = await pool.query(`
      SELECT
        si.product_id,
        p.name AS product_name,
        p.code AS product_code,
        si.quantity,
        si.unit_price,
        si.subtotal
      FROM sale_items si
      LEFT JOIN products p ON p.id = si.product_id
      WHERE si.sale_id = $1
    `, [id]);

    const doc = result.rows[0].customer_document;
    let total_points = 0;
    if (doc) {
      const cRes = await pool.query('SELECT points FROM customers WHERE document_number = $1 LIMIT 1', [doc]);
      if (cRes.rowCount > 0) total_points = cRes.rows[0].points;
    }
    const earned_points = Math.floor(result.rows[0].total / 10);

    const receipt = {
      ...result.rows[0],
      earned_points,
      total_points,
      items: itemsRes.rows
    };

    return receipt;
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
      await pool.query('BEGIN');

      const sourceStockRes = await pool.query(
        'SELECT quantity FROM inventory_stock WHERE branch_id = $1 AND product_id = $2 FOR UPDATE',
        [source_branch, product_id]
      );
      if (sourceStockRes.rowCount === 0 || sourceStockRes.rows[0].quantity < quantity) {
        throw new Error('Stock insuficiente en la sucursal de origen para transferir');
      }

      await pool.query(
        'INSERT INTO inventory_transfers (source_branch_id, destination_branch_id, status, completed_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id',
        [source_branch, dest_branch, 'COMPLETED']
      );

      await pool.query(
        'UPDATE inventory_stock SET quantity = quantity - $1 WHERE branch_id = $2 AND product_id = $3',
        [quantity, source_branch, product_id]
      );

      await pool.query(
        'INSERT INTO inventory_stock (branch_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (branch_id, product_id) DO UPDATE SET quantity = inventory_stock.quantity + $3',
        [dest_branch, product_id, quantity]
      );

      const destStockRes = await pool.query(
        'SELECT quantity FROM inventory_stock WHERE branch_id = $1 AND product_id = $2',
        [dest_branch, product_id]
      );

      await pool.query(
        'INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [source_branch, product_id, 'TRANSFER_OUT', -quantity, sourceStockRes.rows[0].quantity - quantity, 'Transferencia enviada']
      );

      await pool.query(
        'INSERT INTO inventory_movements (branch_id, product_id, movement_type, quantity_change, balance_after, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [dest_branch, product_id, 'TRANSFER_IN', quantity, destStockRes.rows[0].quantity, 'Transferencia recibida']
      );

      await pool.query('COMMIT');
      
      // Insert notification
      await pool.query(
        'INSERT INTO notifications (event_type, content) VALUES ($1, $2)',
        ['TRANSFER_COMPLETED', `Transferencia de ${quantity} unidades completada.`]
      );

      return { success: true, message: 'Transferencia completada' };
    } catch (e: any) {
      await pool.query('ROLLBACK');
      throw new HttpException(e.message || 'Error en la transferencia', HttpStatus.BAD_REQUEST);
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
  async getNotifications() {
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20');
    return result.rows.map(r => ({
      id: r.id,
      type: r.event_type,
      title: (r.event_type === 'SALE_COMPLETED' || r.event_type === 'SaleCompleted') ? 'Venta Completada' : (r.event_type === 'TRANSFER_COMPLETED' ? 'Transferencia' : 'Aviso'),
      message: r.content,
      createdAt: r.created_at
    }));
  }

  @Get('api/customers/search')
  async searchCustomers(@Query('document') document: string) {
    if (!document) return [];
    const result = await pool.query(
      'SELECT id, document_number as document, full_name as name, points FROM customers WHERE document_number ILIKE $1 LIMIT 5',
      [`%${document}%`]
    );
    return result.rows;
  }

  @Get('api/customers/:document')
  async getCustomer(@Param('document') document: string) {
    const result = await pool.query(
      'SELECT id, document_number as document, full_name as name, points FROM customers WHERE document_number = $1 LIMIT 1',
      [document]
    );
    if (result.rowCount === 0) {
      throw new HttpException('Cliente no encontrado', HttpStatus.NOT_FOUND);
    }
    return result.rows[0];
  }

  @Post('api/customers/upsert')
  async upsertCustomer(@Body() body: any) {
    const document = cleanText(body.document);
    const name = cleanText(body.name);

    if (!document || !name) {
      throw new HttpException('Documento y nombre requeridos', HttpStatus.BAD_REQUEST);
    }

    if (!isSafeText(name)) {
      throw new HttpException('El texto ingresado contiene caracteres no permitidos.', HttpStatus.BAD_REQUEST);
    }

    if (!isValidNit(document)) {
      throw new HttpException('El NIT/CI debe contener solo números.', HttpStatus.BAD_REQUEST);
    }

    const exist = await pool.query('SELECT id, document_number as document, full_name as name, points FROM customers WHERE document_number = $1', [document]);
    if (exist.rowCount > 0) {
      const result = await pool.query(
        'UPDATE customers SET full_name = $1 WHERE document_number = $2 RETURNING id, document_number as document, full_name as name, points',
        [name, document]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        'INSERT INTO customers (document_number, full_name, points) VALUES ($1, $2, 0) RETURNING id, document_number as document, full_name as name, points',
        [document, name]
      );
      return result.rows[0];
    }
  }
}