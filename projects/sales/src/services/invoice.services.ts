import { Injectable } from '@angular/core';
import { StorageService } from '@smartstocktz/core-libs';
import { BFast } from 'bfastjs';

@Injectable({
    'providedIn': 'root'
})
export class InvoiceService{
    constructor(private readonly storageService: StorageService){

    }

    async getTotalInvoice(): Promise<number> {
        const shop = await this.storageService.getActiveShop();
        return await BFast.database(shop.projectId)
          .collection('sales')
          .query()
          .count(true)
          .equalTo('channel', 'invoice')
          .find();
      }
  
      async recordPayment(invoice){
        const shop = await this.storageService.getActiveShop();
        return await BFast.database(shop.projectId)
         .collection('sales')
         .query()
         .byId(invoice.id)
         .updateBuilder()
         .set('paid', true).update();
      }
  
      async getInvoices(pagination: { size: number, skip: number }): Promise<any[]> {
          const shop = await this.storageService.getActiveShop();
          return await BFast.database(shop.projectId)
            .collection('sales')
            .query()
            .size(pagination.size)
            .skip(pagination.skip)
            .equalTo('channel', 'invoice')
            .find();
      }
}