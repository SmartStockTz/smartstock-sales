import {Injectable} from '@angular/core';
import {SaleWorker} from '../workers/sale.worker';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {StockModel} from '../models/stock.model';
import {SalesModel} from '../models/sale.model';
import {BatchModel} from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})

export class SaleService {
  private saleWorker: SaleWorker;

  constructor(private readonly userService: UserService) {

  }

  private async initClass(shop: ShopModel) {
    if (!this.saleWorker) {
      const SW = wrap(new Worker(new URL('../workers/sale.worker', import.meta.url))) as unknown as any;
      this.saleWorker = await new SW(shop);
    }
  }

  async getProducts(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.saleWorker.getProducts(shop);
  }

  async saveSale(sales: SalesModel[]) {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    let batchs: BatchModel[];
    const cartId = SecurityUtil.generateUUID();
    batchs = sales.map<BatchModel>(sale => {
      sale.cartId = cartId;
      sale.batch = SecurityUtil.generateUUID();
      return {
        method: 'POST',
        body: sale,
        path: '/classes/sales'
      };
    });
    return this.saleWorker.saveSale(batchs, shop);
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.saleWorker.getProductsRemote(shop);
  }

  async search(query: string): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.saleWorker.search(query, shop);
  }
}
