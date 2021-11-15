import {Injectable} from '@angular/core';
import {InvoiceItemModel} from '../models/invoice-item.model';
import {InvoiceModel} from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceCartService {

  constructor() {
  }

  async findTotal(carts: InvoiceItemModel[]): Promise<number> {
    return carts.map<number>(value => {
      return value.quantity * value.amount;
    }).reduce((a, b) => {
      return a + b;
    }, 0);
  }

  async addToCart(carts: InvoiceItemModel[], cart: any) {
    let update = false;
    carts.map(x => {
      if (x.stock.id === cart.stock.id) {
        x.quantity += cart.quantity;
        update = true;
      }
      return x;
    });
    if (update === false) {
      carts.push(cart);
    }
    return carts;
  }

  async checkout(purchase: InvoiceModel): Promise<any> {
    // const shop = await this.userService.getCurrentShop();
    // return database(shop.projectId).table('purchases').save(invoice);
  }

  async printCart(carts: any[], channel: string, discount: number, customer: any, printOnly: boolean): Promise<any> {
    discount = isNaN(discount) ? 0 : discount;
    // const saleItems = await this.cartWorker.cartItemsToSaleItems(carts, discount, channel);
    // const salesItemForPrint = await this.cartWorker.cartItemsToPrinterData(saleItems, customer, channel, discount, printOnly);
    // console.log(salesItemForPrint);
    // await this.printService.print({
    //   data: salesItemForPrint,
    //   printer: 'tm20',
    //   id: SecurityUtil.generateUUID(),
    //   qr: null
    // });
  }
}
