import {Injectable} from '@angular/core';
import {CartItemModel} from '../models/cart-item.model';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {CartWorker} from '../workers/cart.worker';
import {PrintService, SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {SaleService} from './sale.service';
import {SalesModel} from '../models/sale.model';
import {CustomerModel} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartWorker: CartWorker;
  cartWorkerNative;

  constructor(private userService: UserService,
              private salesService: SaleService,
              private readonly printService: PrintService) {
  }

  private async initWorker(shop: ShopModel) {
    if (!this.cartWorker) {
      this.cartWorkerNative = new Worker(new URL('../workers/cart.worker', import.meta.url));
      const SW = wrap(this.cartWorkerNative) as unknown as any;
      this.cartWorker = await new SW(shop);
    }
  }

  stopWorker() {
    if (this.cartWorkerNative) {
      this.cartWorkerNative.terminate();
      this.cartWorker = undefined;
      this.cartWorkerNative = undefined;
    }
  }

  async findTotal(carts: CartItemModel[], channel: string, discount: any): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    await this.initWorker(shop);
    return this.cartWorker.findTotal(carts, channel, discount);
  }

  async addToCart(carts: CartItemModel[], cart: CartItemModel) {
    const shop = await this.userService.getCurrentShop();
    await this.initWorker(shop);
    return this.cartWorker.addToCart(carts, cart);
  }

  async checkout(
    carts: CartItemModel[],
    customer: CustomerModel,
    channel: string,
    discount: number,
    user: any
  ): Promise<any> {
    discount = isNaN(discount) ? 0 : discount;
    const shop = await this.userService.getCurrentShop();
    await this.initWorker(shop);
    const saleItems = await this.cartWorker.cartItemsToSaleItems(carts, discount, channel);
    const salesItemForPrint = await this.cartWorker.cartItemsToPrinterData(saleItems, customer, channel, discount);
    // console.log(salesItemForPrint);
    await this.printService.print({
      data: salesItemForPrint,
      printer: 'tm20',
      id: SecurityUtil.generateUUID(),
      qr: null
    });
    const salesToSave: SalesModel[] = await this.cartWorker.getSalesBatch(carts, channel, discount, customer, user);
    return this.salesService.saveSale(salesToSave);
  }

}
