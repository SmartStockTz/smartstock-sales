import {expose} from 'comlink';
import {bfast} from 'bfastjs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';
import {BatchModel} from '../models/batch.model';
import {sha256} from 'crypto-hash';

function init(shop: ShopModel) {
  bfast.init({
    applicationId: 'smartstock_lb',
    projectId: 'smartstock'
  });
  bfast.init({
    applicationId: shop.applicationId,
    projectId: shop.projectId,
    adapters: {
      auth: 'DEFAULT'
    }
  }, shop.projectId);
}

export class SaleWorker {

  remoteAllProductsRunning = false;

  constructor(shop: ShopModel) {
    init(shop);
  }

  private static async productsLocalHashMap(localCustomers: any[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(localCustomers)) {
      for (const localC of localCustomers) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
  }

  private static async getProductsLocal(shop: ShopModel): Promise<StockModel[]> {
    return bfast.cache({database: shop.projectId, collection: 'stocks'}, shop.projectId).get('all');
  }

  // private static async setProductLocal(customer: StockModel, shop: ShopModel) {
  //   return bfast.cache({database: shop.projectId, collection: 'stocks'}, shop.projectId).set(customer.id, customer);
  // }

  private static async setProductsLocal(products: StockModel[], shop: ShopModel) {
    // for (const customer of customers) {
    //   await SaleWorker.setProductLocal(customer, shop);
    // }
    return bfast.cache({database: shop.projectId, collection: 'stocks'}, shop.projectId).set('all', products);
  }

  private async remoteAllProducts(shop: ShopModel, hashes: any[] = []): Promise<StockModel[]> {
    this.remoteAllProductsRunning = true;
    return bfast.database(shop.projectId)
      .collection('stocks')
      .getAll<StockModel>({
        hashes
      }).finally(() => {
        this.remoteAllProductsRunning = false;
      });
  }

  private remoteProductsMapping(products: StockModel[], hashesMap): StockModel[] {
    if (Array.isArray(products)) {
      products = products.map(x => {
        if (hashesMap[x.toString()]) {
          return hashesMap[x.toString()];
        } else {
          return x;
        }
      });
    }
    return products;
  }

  async getProducts(shop: ShopModel): Promise<StockModel[]> {
    const localProducts: any[] = await SaleWorker.getProductsLocal(shop);
    if (localProducts && localProducts?.length !== 0) {
      return localProducts;
    } else {
      return this.getProductsRemote(shop);
    }
  }

  async saveSale(batchs: BatchModel[], shop: ShopModel): Promise<any> {
    return Promise.resolve(undefined);
  }

  async getProductsRemote(shop: ShopModel): Promise<StockModel[]> {
    const localProducts = await SaleWorker.getProductsLocal(shop);
    const hashesMap = await SaleWorker.productsLocalHashMap(localProducts);
    let products;
    try {
      products = await this.remoteAllProducts(shop, Object.keys(hashesMap));
      products = this.remoteProductsMapping(products, hashesMap);
    } catch (e) {
      console.log(e);
      products = localProducts;
    }
    await SaleWorker.setProductsLocal(products, shop);
    return products;
  }

  async search(query: string, shop: ShopModel): Promise<StockModel[]> {
    return [];
  }
}

expose(SaleWorker);
