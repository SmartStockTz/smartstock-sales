import {Injectable} from '@angular/core';
import {SaleWorker} from '../workers/sale.worker';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {StockModel} from '../models/stock.model';
import {SalesModel} from '../models/sale.model';
import {bfast} from 'bfastjs';

@Injectable({
  providedIn: 'root'
})

export class SaleService {
  private saleWorker: SaleWorker;
  private saleWorkerNative;
  private changes;

  constructor(private readonly userService: UserService) {

  }

  async startWorker(shop: ShopModel) {
    if (!this.saleWorker) {
      this.saleWorkerNative = new Worker(new URL('../workers/sale.worker', import .meta.url));
      const SW = wrap(this.saleWorkerNative) as unknown as any;
      this.saleWorker = await new SW(shop);
    }
  }

  stopWorker() {
    if (this.saleWorkerNative) {
      this.saleWorkerNative.terminate();
      this.saleWorker = undefined;
      this.saleWorkerNative = undefined;
    }
  }

  async getProducts(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.saleWorker.getProducts(shop);
  }

  async saveSale(sales: SalesModel[]) {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const cartId = SecurityUtil.generateUUID();
    return this.saleWorker.saveSale(sales, shop, cartId);
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.saleWorker.getProductsRemote(shop);
  }

  async search(query: string): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.saleWorker.search(query, shop);
  }

  async listeningStocks(): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    this.changes = bfast.database(shop.projectId)
      .table('stocks')
      .query()
      .changes(() => {
        console.log('stocks-sales changes connected');
        this.getProductsRemote().catch(console.log);
      }, () => {
        console.log('stocks-sales changes disconnected');
      });
    this.changes.addListener(async response => {
      if (response && response.body && response.body.change) {
        // console.log(response.body.change);
        if (response.body.change.name === 'create') {
          this.setProductLocal(response.body.change.snapshot).catch(console.log);
        } else if (response.body.change.name === 'update') {
          this.setProductLocal(response.body.change.snapshot).catch(console.log);
        } else if (response.body.change.name === 'delete') {
          await this.removeProductLocal(response.body.change.snapshot);
        } else {
        }
      }
    });
  }

  async listeningStocksStop() {
    this.changes?.close();
  }

  private async setProductLocal(product: StockModel) {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    await this.saleWorker.setProductLocal(product, shop);
  }

  private async removeProductLocal(product: StockModel) {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    await this.saleWorker.removeProductLocal(product, shop);
  }
}
