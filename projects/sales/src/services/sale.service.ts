import {Injectable} from '@angular/core';
import {SaleWorker} from '../workers/sale.worker';
import {IpfsService, SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {StockModel} from '../models/stock.model';
import {SalesModel} from '../models/sale.model';
import * as bfast from 'bfast';
import {CidService} from './cid.service';

@Injectable({
  providedIn: 'root'
})

export class SaleService {
  private saleWorker: SaleWorker;
  private saleWorkerNative;
  private changes;
  private remoteAllProductsRunning: boolean;

  constructor(private readonly userService: UserService,
              private readonly cidService: CidService) {

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

  private async remoteAllProducts(shop: ShopModel): Promise<StockModel[]> {
    this.remoteAllProductsRunning = true;
    const cids = await bfast.database(shop.projectId)
      .collection('stocks')
      .getAll<string>({
        cids: true
      }).finally(() => {
        this.remoteAllProductsRunning = false;
      });
    // console.log(cids.length, 'total cids');
    return this.cidService.toDatas(cids);
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const products = await this.remoteAllProducts(shop);
    // console.log(products?.length, 'total all products');
    return this.saleWorker.getProductsRemote(shop, products);
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
        // this.getProductsRemote().catch(console.log);
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
