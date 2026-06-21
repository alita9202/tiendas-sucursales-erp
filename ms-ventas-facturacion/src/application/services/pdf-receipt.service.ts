import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ReceiptResponseDto } from '../dto/receipt-response.dto';

@Injectable()
export class PdfReceiptService {
  async generate(data: ReceiptResponseDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: [300, 600], margin: 12 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      let y = 20;
      const left = 20;
      const right = 280;
      const w = 260;
      const cx = left + w / 2;
      const labelW = 80;

      const hr = () => {
        y += 4;
        doc.moveTo(left, y).lineTo(right, y).lineWidth(0.5).strokeColor('#888').stroke();
        doc.strokeColor('#000').lineWidth(1);
        y += 6;
      };

      const hrThin = () => {
        y += 3;
        doc.moveTo(left + 4, y).lineTo(right - 4, y).lineWidth(0.3).strokeColor('#bbb').stroke();
        doc.strokeColor('#000').lineWidth(1);
        y += 5;
      };

      const line = (text: string, size = 7, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size);
        doc.text(text, left, y, { width: w, align: 'left' });
        y = doc.y + 2;
      };

      const lineCenter = (text: string, size = 7, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size);
        doc.text(text, left, y, { width: w, align: 'center' });
        y = doc.y + 2;
      };

      const labeled = (label: string, value: string) => {
        doc.font('Helvetica-Bold').fontSize(7).text(label, left, y, { width: labelW });
        doc.font('Helvetica').fontSize(7).text(value, left + labelW, y, { width: w - labelW, align: 'left' });
        y = doc.y + 2;
      };

      const totalRow = (label: string, value: string, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(7);
        doc.text(label, left, y, { width: w - 80, align: 'left' });
        doc.text(value, left, y, { width: w, align: 'right' });
        y = doc.y + 2;
      };

      // ── Header block ──
      lineCenter('MI EMPRESA S.R.L.', 11, true);
      lineCenter('Sucursal: OXXO Prado', 7, false);
      lineCenter('Av. Heroinas #123', 7, false);
      lineCenter('Tel: (591) 2-1234567', 7, false);
      lineCenter('NIT: 1234567890123', 7, false);

      hr();

      // ── Receipt title ──
      lineCenter('COMPROBANTE DE VENTA', 10, true);
      lineCenter(`Nro: ${data.receipt_number}`, 7, false);

      hr();

      // ── Client info ──
      labeled('Cliente:', data.customer_name || 'N/A');
      labeled('NIT/CI:', data.customer_nit || 'N/A');
      labeled('Método:', data.payment_method);
      labeled('Fecha:', new Date(data.sale_date).toLocaleString('es-BO'));

      hr();

      // ── Items table ──
      doc.font('Helvetica-Bold').fontSize(7);
      doc.text('Cant', left, y, { width: 25 });
      doc.text('Descripcion', left + 25, y, { width: w - 100 });
      doc.text('Subtotal', left, y, { width: w, align: 'right' });
      y = doc.y + 1;

      hrThin();

      doc.font('Helvetica').fontSize(7);
      for (const item of data.items) {
        doc.text(`${item.quantity}`, left, y, { width: 25 });
        doc.text(`Prod. ${item.product_id.slice(0, 8)}`, left + 25, y, { width: w - 100 });
        doc.text(`Bs ${Number(item.subtotal).toFixed(2)}`, left, y, { width: w, align: 'right' });
        y = doc.y + 2;
      }

      hr();

      // ── Totals ──
      totalRow('Subtotal:', `Bs ${Number(data.subtotal).toFixed(2)}`);
      totalRow(`IVA (${(data.tax_rate * 100).toFixed(0)}%):`, `Bs ${Number(data.tax_amount).toFixed(2)}`);
      totalRow('TOTAL PAGADO:', `Bs ${Number(data.total).toFixed(2)}`, true);

      hr();

      // ── Footer ──
      lineCenter('¡Gracias por su compra!', 7, false);
      lineCenter('Visítenos en OXXO Prado', 6, false);

      doc.end();
    });
  }
}
