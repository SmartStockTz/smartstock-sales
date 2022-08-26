import { Injectable } from '@angular/core';
import { CartItemModel } from '../models/cart-item.model';
import { wrap } from 'comlink';
import { CartWorker } from '../workers/cart.worker';
import {
  LibUserModel,
  PrintService,
  SecurityUtil,
  UserService
} from 'smartstock-core';
import { SaleService } from './sale.service';
import { SalesModel } from '../models/sale.model';
import { CustomerModel } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(
    private userService: UserService,
    private salesService: SaleService,
    private readonly printService: PrintService
  ) {}

  private static async withWorker(
    fn: (cartWorker: CartWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL('../workers/cart.worker', import .meta.url)
      );
      const SW = (wrap(nativeWorker) as unknown) as any;
      const stWorker = await new SW();
      return await fn(stWorker);
    } finally {
      if (nativeWorker) {
        nativeWorker.terminate();
      }
    }
  }

  async findTotal(
    carts: CartItemModel[],
    channel: string,
    discount: any
  ): Promise<number> {
    return CartService.withWorker((cartWorker) =>
      cartWorker.findTotal(carts, channel, discount)
    );
  }

  async addToCart(carts: CartItemModel[], cart: CartItemModel) {
    const shop = await this.userService.getCurrentShop();
    return CartService.withWorker((cartWorker) =>
      cartWorker.addToCart(carts, cart)
    );
  }

  async checkout(
    carts: CartItemModel[],
    customer: CustomerModel,
    channel: string,
    discount: number,
    user: LibUserModel
  ): Promise<any> {
    discount = isNaN(discount) ? 0 : discount / carts.length;
    await this.printCart(carts, channel, discount, customer, false);
    const salesToSave: SalesModel[] = await CartService.withWorker(
      (cartWorker) =>
        cartWorker.getSalesBatch(carts, channel, discount, customer, user)
    );
    return this.salesService.saveSale(salesToSave);
  }

  async printCart(
    carts: CartItemModel[],
    channel: string,
    discount: number,
    customer: CustomerModel,
    printOnly: boolean
  ): Promise<any> {
    discount = isNaN(discount) ? 0 : discount;
    const saleItems = await CartService.withWorker((cartWorker) =>
      cartWorker.cartItemsToSaleItems(carts, discount, channel)
    );
    const salesItemForPrint = await CartService.withWorker((cartWorker) =>
      cartWorker.cartItemsToPrinterData(
        saleItems,
        customer,
        channel,
        discount,
        printOnly
      )
    );
    await this.printService.print({
      data: salesItemForPrint,
      printer: 'tm20',
      id: SecurityUtil.generateUUID(),
      qr: null
    });
  }
}
