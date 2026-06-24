import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';

if (!(global as any).sysEventEmitter) {
  (global as any).sysEventEmitter = new EventEmitter();
}
const sysEventEmitter = new EventEmitter();

@Injectable()
export class InventoryNotificationService implements OnModuleInit {
  
  // Se ejecuta automáticamente al arrancar el microservicio
  onModuleInit() {
    // 1. Escuchar la creación de transferencias
    sysEventEmitter.on('inventory.transfer.created', (payload) => {
      console.log('\n================ [NOTIFICACIÓN ASÍNCRONA NATIVA] ================');
      console.log(`🔔 Alerta de Inventario: Nueva transferencia registrada en estado PENDING.`);
      console.log(`📦 ID Transferencia: ${payload.transfer_id}`);
      console.log(`🏢 Origen: Sucursal [${payload.source_branch_id}] ➡️ Destino: Sucursal [${payload.destination_branch_id}]`);
      console.log(`📅 Fecha: ${payload.timestamp.toLocaleString()}`);
      console.log('=================================================================\n');
    });

    // 2. Escuchar la finalización de transferencias
    sysEventEmitter.on('inventory.transfer.completed', (payload) => {
      console.log('\n================ [NOTIFICACIÓN ASÍNCRONA NATIVA] ================');
      console.log(`✅ Alerta de Inventario: ¡Transferencia Completada con Éxito!`);
      console.log(`📦 ID Transferencia: ${payload.transfer_id}`);
      console.log(`🔄 El stock físico real ya fue alterado y actualizado en PostgreSQL.`);
      console.log('=================================================================\n');
    });
  }
}

