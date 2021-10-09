import {Injectable} from '@angular/core';
import {SaleWorker} from '../workers/sale.worker';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {StockModel} from '../models/stock.model';
import {SalesModel} from '../models/sale.model';
import {database} from 'bfast';

@Injectable({
  providedIn: 'root'
})

export class SaleService {
  private saleWorker: SaleWorker;
  private saleWorkerNative;
  private remoteAllProductsRunning: boolean;

  constructor(private readonly userService: UserService) {

  }

  async startWorker(shop: ShopModel) {
    if (!this.saleWorker) {
      this.saleWorkerNative = new Worker(new URL('../workers/sale.worker', import .meta.url));
      const SW = wrap(this.saleWorkerNative) as unknown as any;
      this.saleWorker = await new SW(shop);
    }
  }

  // stopWorker() {
  //   if (this.saleWorkerNative) {
  //     this.saleWorkerNative.terminate();
  //     this.saleWorker = undefined;
  //     this.saleWorkerNative = undefined;
  //   }
  // }

  async products(): Promise<StockModel[]> {
    await this.listeningStocks();
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const p = database(shop.projectId).syncs('stocks').changes().values();
    const products: StockModel[] = Array.from(p ? p : []);
    return this.saleWorker.filterSaleableProducts(products, shop);
    // return [];
  }

  async saveSale(sales: SalesModel[]) {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const cartId = SecurityUtil.generateUUID();
    return this.saleWorker.saveSale(sales, shop, cartId);
  }

  private async remoteAllProducts(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    try {
      this.remoteAllProductsRunning = true;
      const status = await database(shop.projectId).syncs('stocks').upload();
      if (status) {
        const p = database(shop.projectId).syncs('stocks').changes().values();
        return Array.from(p);
      } else {
        throw {message: 'products load fail with false status'};
      }
    } finally {
      this.remoteAllProductsRunning = false;
    }
    return [];
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const products = await this.remoteAllProducts();
    // console.log(products?.length, 'total all products');
    return this.saleWorker.filterSaleableProducts(products, shop);
    // return [];
  }

  async search(query: string): Promise<StockModel[]> {
    await this.listeningStocks();
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const p = database(shop.projectId).syncs('stocks').changes().values();
    const products: StockModel[] = Array.from(p ? p : []);
    return this.saleWorker.search(products, query, shop);
    // return [];
  }

  async listeningStocks(): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('stocks');
  }

  async listeningStocksStop() {
    // try {
    //   this.syncs?.close();
    // } catch (e) {
    //   console.log(e, '********');
    // } finally {
    //   this.syncs = undefined;
    // }
  }
}
