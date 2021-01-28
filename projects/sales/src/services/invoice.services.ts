import {Injectable} from '@angular/core';
import {SettingsService, StorageService} from '@smartstocktz/core-libs';
import {BFast} from 'bfastjs';
import {InvoiceModel} from '../models/invoice.model';
import {QueryOrder} from 'bfastjs/dist/controllers/QueryController';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private readonly storageService: StorageService,
              private settingsService: SettingsService,
             ) {

  }

  async getInvoices(pagination: { size: number, skip: number }): Promise<InvoiceModel[]> {
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId)
      .collection('invoices')
      .query()
      .orderBy('date', -1)
      .size(pagination.size)
      .skip(pagination.skip)
      .find();
  }

  async invoicesCount(): Promise<number>{
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId)
      .collection('invoices')
      .query()
      .count(true)
      .find();
  }

  async saveInvoice(invoice: InvoiceModel){
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId)
      .collection('invoices')
      .save(invoice);
  }

  async addReturn(id: string, value: any) {
    const shop = await this.storageService.getActiveShop();
    const invoice: InvoiceModel = await BFast.database(shop.projectId)
      .collection('invoices')
      .query()
      .byId( id)
      .find();

    const returns = [];

    if (invoice && invoice.returns && Array.isArray(invoice.returns)){
      invoice.returns.push(value);
    } else {
      invoice.returns = [value];
    }

    delete invoice.updatedAt;

    return await BFast.database(shop.projectId)
      .collection('invoices')
      .query()
      .byId(id)
      .updateBuilder()
      .doc(invoice)
      .update();
  }
}
