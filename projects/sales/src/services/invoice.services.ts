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

  async getInvoices(pagination: { size: number, skip: number }): Promise<InvoiceModel[]> {
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId)
      .collection('invoices')
      .query()
      .orderBy('_created_at', -1)
      .size(pagination.size)
      .skip(pagination.skip)
      .find();
  }

  async invoicesCount(): Promise<number> {
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId)
      .collection('invoices')
      .query()
      .count(true)
      .find();
  }

  async saveInvoice(invoice: InvoiceModel) {
    const shop = await this.storageService.getActiveShop();
    return await BFast.database(shop.projectId).transaction()
      .create('invoices', invoice)
      .update('stocks', invoice.items.map(item => {
        return {
          update: {
            $inc: {
              quantity: -Number(item.quantity)
            }
          },
          query: {
            id: item.stock.id
          },
        };
      })).commit();
  }

  async addReturn(id: string, value: any) {
    const shop = await this.storageService.getActiveShop();
    const invoice: InvoiceModel = await BFast.database(shop.projectId)
      .collection('invoices')
      .get(id);

    if (invoice && invoice.returns && Array.isArray(invoice.returns)) {
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
