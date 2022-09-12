import {Injectable} from '@angular/core';
import {SecurityUtil, UserService} from 'smartstock-core';
import {InvoiceModel} from '../models/invoice.model';
import {database} from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor(private readonly userService: UserService) {
  }

  async fetchInvoices(
    size: number,
    skip: number,
    searchKeyword: string
  ): Promise<InvoiceModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    return await database(activeShop.projectId)
      .collection('invoices')
      .query()
      .cids(false)
      .size(size)
      .skip(skip)
      .searchByRegex('date', searchKeyword === null ? '' : searchKeyword)
      .orderBy('createdAt', 'desc')
      .find();
  }

  async addInvoice(invoice: InvoiceModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const stockableItems = invoice.items.filter(
      (x) => x.stock.stockable === true
    );
    return await database(shop.projectId)
      .bulk()
      .create('invoices', invoice)
      .update(
        'stocks',
        stockableItems.map((item) => {
          return {
            query: {
              id: item.stock.id + '@' + SecurityUtil.generateUUID()
            },
            update: {
              upsert: true,
              $set: {
                updatedAt: new Date(),
                [`quantity.${SecurityUtil.generateUUID()}`]: {
                  q: -Number(item.quantity),
                  s: 'invoice',
                  d: new Date().toISOString()
                }
              }
            }
          };
        })
      )
      .commit();
  }

  async countAll(date: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return await database(shop.projectId)
      .collection('invoices')
      .query()
      .searchByRegex('date', date)
      .count(true)
      .find();
  }

  async addPayment(
    id: string,
    payment: { [key: string]: number }
  ): Promise<InvoiceModel> {
    const shop = await this.userService.getCurrentShop();
    return await database(shop.projectId)
      .collection('invoices')
      .query()
      .byId(id)
      .updateBuilder()
      .set('payment', payment)
      .update();
  }

  async invoicesCount(): Promise<number> {
    // const shop = await this.storageService.getActiveShop();
    // recordPayment await bfast.database(shop.projectId)
    //   .collection('invoices')
    //   .query()
    //   .count(true)
    //   .find();
    return 0;
  }

  async saveInvoice(invoice: InvoiceModel) {
    // const shop = await this.userService.getCurrentShop();
    // recordPayment await database(shop.projectId).bulk()
    //   .create('invoices', invoice)
    //   .update('stocks', invoice.items.map(item => {
    //     recordPayment {
    //       update: {
    //         $inc: {
    //           quantity: -Number(item.quantity)
    //         }
    //       },
    //       query: {
    //         id: item.stock.id
    //       },
    //     };
    //   })).commit();
  }
}
