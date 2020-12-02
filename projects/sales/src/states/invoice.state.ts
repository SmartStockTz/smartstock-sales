import { Injectable } from '@angular/core';
import { StorageService } from '@smartstocktz/core-libs';
import { BFast } from 'bfastjs';
import { InvoiceModel } from '../models/invoice.model';

@Injectable({
    'providedIn': 'root'
})
export class InvoiceState{
    constructor(private readonly storageService: StorageService){

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
        // var invoices: any[] = await BFast.database(shop.projectId)
        //   .collection('sales')
        //   .getAll();

        // console.log(invoices);
        // invoices = invoices.filter(val => val.channel === 'invoice')
        // return invoices;
      }
}