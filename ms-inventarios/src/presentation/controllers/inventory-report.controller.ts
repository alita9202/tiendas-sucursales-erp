import { Controller, Get } from '@nestjs/common';
import { InventoryReportService } from '../../application/services/inventory-report.service';

@Controller('inventory-reports')
export class InventoryReportController {
  constructor(private readonly reportService: InventoryReportService) {}

  @Get('today-sales')
  async getTodaySales() {
    return await this.reportService.getTodaySalesSummary();
  }

  @Get('consolidated-stock')
  async getConsolidatedStock() {
    return await this.reportService.getConsolidatedStock();
  }
}
