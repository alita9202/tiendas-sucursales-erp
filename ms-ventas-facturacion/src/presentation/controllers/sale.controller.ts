import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, ValidationPipe, StreamableFile, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SaleService } from '../../application/services/sale.service';
import { PdfReceiptService } from '../../application/services/pdf-receipt.service';
import { CreateSaleDto } from '../../application/dto/create-sale.dto';
import { UpdateSaleDto } from '../../application/dto/update-sale.dto';
import { ReceiptResponseDto } from '../../application/dto/receipt-response.dto';

@ApiTags('sales')
@Controller('sales')
export class SaleController {
  constructor(
    private readonly service: SaleService,
    private readonly pdfService: PdfReceiptService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createDto: CreateSaleDto) {
    return await this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales' })
  @ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale retrieved successfully' })
  async findById(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Get sale receipt with taxes' })
  @ApiResponse({ status: 200, description: 'Receipt retrieved successfully', type: ReceiptResponseDto })
  async getReceipt(@Param('id') id: string) {
    return await this.service.getReceipt(id);
  }

  @Get(':id/receipt/pdf')
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({ summary: 'Download receipt as PDF' })
  @ApiResponse({ status: 200, description: 'PDF receipt' })
  async getReceiptPdf(@Param('id') id: string) {
    const receipt = await this.service.getReceipt(id);
    const buffer = await this.pdfService.generate(receipt);
    return new StreamableFile(buffer, {
      disposition: `inline; filename="recibo-${receipt.receipt_number}.pdf"`,
    });
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Get sales by branch' })
  @ApiResponse({ status: 200, description: 'Sales retrieved successfully' })
  async findByBranch(@Param('branchId') branchId: string) {
    return await this.service.findByBranch(branchId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: 200, description: 'Sale updated successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Param('id') id: string, @Body() updateDto: UpdateSaleDto) {
    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/delete sale' })
  @ApiResponse({ status: 200, description: 'Sale deleted successfully' })
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
