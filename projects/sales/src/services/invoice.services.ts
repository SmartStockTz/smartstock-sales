import {Injectable} from '@angular/core';
import {SettingsService, StorageService} from '@smartstocktz/core-libs';
import {BFast} from 'bfastjs';
import {InvoiceModel} from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private readonly storageService: StorageService,
              private settingsService: SettingsService,
             ) {

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

  async recordPayment(invoice) {
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

  async saveInvoice(invoice: InvoiceModel){
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId)
      .collection('sales')
      .save(invoice);
    // return await BFast.functions().request('http://localhost:3000/functions/invoices').post(invoice, {
    //   headers: this.settingsService.ssmFunctionsHeader
    // });
  }

  async saveInvoiceLocally(invoice){

  }
}
