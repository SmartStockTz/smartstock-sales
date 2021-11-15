import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';

export class SaleWorker {

  constructor() {
  }

  async filterSaleableProducts(products: StockModel[], shop: ShopModel): Promise<StockModel[]> {
    return products.filter(x => x.saleable);
  }

  // async saveSale(sales: SalesModel[], shop: ShopModel, cartId: string): Promise<any> {
  //   // init(shop);
  //   // const batchs = [];
  //   for (const sale of sales) {
  //     sale.id = SecurityUtil.generateUUID();
  //     sale.cartId = cartId;
  //     sale.createdAt = new Date().toISOString();
  //     sale.batch = SecurityUtil.generateUUID();
  //     await cache().addSyncs({
  //       applicationId: shop.applicationId,
  //       projectId: shop.projectId,
  //       payload: sale,
  //       action: 'create',
  //       databaseURL: getDaasAddress(shop),
  //       tree: 'sales'
  //     });
  //     if (sale.stock.stockable === true) {
  //       await cache().addSyncs({
  //         applicationId: shop.applicationId,
  //         projectId: shop.projectId,
  //         payload: {
  //           id: sale.stock.id,
  //           [`quantity.${await sha1(JSON.stringify(sale))}`]: {
  //             q: -sale.quantity,
  //             s: 'sale',
  //             d: new Date().toISOString()
  //           }
  //         },
  //         tree: 'stocks',
  //         action: 'update',
  //         databaseURL: getDaasAddress(shop)
  //       });
  //     }
  //   }
  // }

  async search(stocks: StockModel[], query: string, shop: ShopModel): Promise<StockModel[]> {
    return stocks.filter(x => {
      return (x?.saleable === true) && (x?.product?.toString()?.toLowerCase().includes(query?.toLowerCase()));
    });
  }

}

expose(SaleWorker);
