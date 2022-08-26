import {Injectable} from '@angular/core';
import {SaleWorker} from '../workers/sale.worker';
import {getDaasAddress, SecurityUtil, UserService} from 'smartstock-core';
import {wrap} from 'comlink';
import {StockModel} from '../models/stock.model';
import {SalesModel} from '../models/sale.model';
import {cache, functions} from 'bfast';
import {sha1} from 'crypto-hash';
import {updateStockInLocalSyncs} from '../utils/stock.util';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  // private changes: SocketController;

  constructor(private readonly userService: UserService) {
  }

  private static async withWorker(
    fn: (saleWorker: SaleWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL('../workers/sale.worker', import .meta.url)
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

  async products(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    return cache({database: shop.projectId, collection: 'stocks'})
      .getAll()
      .then((stocks) => {
        if (Array.isArray(stocks) && stocks.length > 0) {
          return stocks;
        }
        return this.getProductsRemote().then((rP) => {
          cache({database: shop.projectId, collection: 'stocks'})
            .setBulk(
              rP.map((x) => x.id),
              rP
            )
            .catch(console.log);
          return rP;
        });
      });
  }

  async saveSale(sales: SalesModel[]) {
    const shop = await this.userService.getCurrentShop();
    const cartId = SecurityUtil.generateUUID();
    for (const sale of sales) {
      sale.id = SecurityUtil.generateUUID();
      sale.cartId = cartId;
      sale.createdAt = new Date().toISOString();
      sale.batch = SecurityUtil.generateUUID();
      await cache().addSyncs({
        applicationId: shop.applicationId,
        projectId: shop.projectId,
        payload: sale,
        action: 'create',
        databaseURL: getDaasAddress(shop),
        tree: 'sales'
      });
      if (sale.stock.stockable === true) {
        await cache().addSyncs({
          applicationId: shop.applicationId,
          projectId: shop.projectId,
          payload: {
            id: `${sale.stock.id}@${SecurityUtil.generateUUID()}`,
            product: sale.product,
            [`quantity.${SecurityUtil.generateUUID()}`]: {
              q: -sale.quantity,
              s: 'sale',
              d: new Date().toISOString()
            }
          },
          tree: 'stocks',
          action: 'update',
          databaseURL: getDaasAddress(shop)
        });
        await updateStockInLocalSyncs(sale, shop);
      }
    }
  }

  shopBaseUrl = shop =>
    `https://smartstock-faas.bfast.fahamutech.com/shop/${shop.projectId}/${shop.applicationId}`;

  async getAllStockRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    return functions().request(`${this.shopBaseUrl(shop)}/stock/products`).get();
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    const products = await this.getAllStockRemote();
    return SaleService.withWorker((saleWorker) => {
      return saleWorker.filterSaleableProducts(products, shop);
    });
  }

  async search(query: string): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    const products: StockModel[] = await this.products();
    return SaleService.withWorker((saleWorker) => {
      return saleWorker.search(products, query, shop);
    });
  }

  async listeningStocksStop(): Promise<void> {
  }

  async listeningStocks(): Promise<void> {
  }
}
