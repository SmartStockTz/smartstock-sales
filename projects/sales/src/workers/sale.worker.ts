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
    this.stocksListening(shop);
  }

  private async productsLocalHashMap(localCustomers: any[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(localCustomers)) {
      for (const localC of localCustomers) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
  }

  async getProductsLocal(shop: ShopModel): Promise<StockModel[]> {
    return bfast.cache({database: 'stocks', collection: 'stocks'}, shop.projectId).get('all');
  }

  async removeProductLocal(product: StockModel, shop: ShopModel) {
    const stocks = await this.getProductsLocal(shop);
    return this.setProductsLocal(stocks.filter(x => x.id !== product.id), shop);
  }

  async setProductLocal(product: StockModel, shop: ShopModel) {
    let stocks = await this.getProductsLocal(shop);
    let update = false;
    stocks = stocks.map(x => {
      if (x.id === product.id) {
        update = true;
        return product;
      } else {
        return x;
      }
    });
    if (update === false) {
      stocks.push(product);
    }
    return this.setProductsLocal(stocks, shop);
  }

  async setProductsLocal(products: StockModel[], shop: ShopModel) {
    // for (const product of products) {
    //   await this.setProductLocal(product, shop);
    // }
    return bfast.cache({database: 'stocks', collection: 'stocks'}, shop.projectId).set('all', products);
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

  private stocksListening(shop: ShopModel) {

  }

  stocksListeningStop(shop) {
    // for (const client of wss.clients) {
    // client.close();
    // console.log(client);
    // }
    // self.stop();
  }

  async getProducts(shop: ShopModel): Promise<StockModel[]> {
    return await this.getProductsLocal(shop);
    // if (localProducts && localProducts?.length !== 0) {
    //   return localProducts.filter(x => x.saleable);
    // } else {
    //   return this.getProductsRemote(shop);
    // }
  }

  async saveSale(batchs: BatchModel[], shop: ShopModel): Promise<any> {
    return Promise.resolve(undefined);
  }

  async getProductsRemote(shop: ShopModel): Promise<StockModel[]> {
    const localProducts = await this.getProductsLocal(shop);
    const hashesMap = await this.productsLocalHashMap(localProducts);
    let products: StockModel[];
    try {
      products = await this.remoteAllProducts(shop, Object.keys(hashesMap));
      products = this.remoteProductsMapping(products, hashesMap);
    } catch (e) {
      console.log(e);
      products = localProducts;
    }
    await this.setProductsLocal(products, shop);
    return products.filter(x => x.saleable);
  }

  async search(query: string, shop: ShopModel): Promise<StockModel[]> {
    const stocks = await this.getProductsLocal(shop);
    return stocks.filter(x => x?.product?.toLowerCase().includes(query.toLowerCase()));
  }
}

expose(SaleWorker);
