import {expose} from 'comlink';
import {bfast} from 'bfastjs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';
import {BatchModel} from '../models/batch.model';
import {sha256} from 'crypto-hash';
import {SecurityUtil} from '@smartstocktz/core-libs';
import {SalesModel} from '../models/sale.model';

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
  private static shouldSaleSyncInit;

  constructor(shop: ShopModel) {
    init(shop);
    this.syncSales();
  }

  remoteAllProductsRunning = false;
  shouldSaleSync = true;

  private static async productsLocalHashMap(localCustomers: any[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(localCustomers)) {
      for (const localC of localCustomers) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
  }

  private static async getShops() {
    try {
      const user = await bfast.auth().currentUser();
      if (user && user.shops && Array.isArray(user.shops)) {
        const shops: ShopModel[] = [...user.shops];
        shops.push({
          applicationId: user.applicationId,
          projectId: user.projectId,
          settings: user.settings,
          category: user.category,
          businessName: user.businessName,
          country: user.country,
          ecommerce: user.ecommerce,
          rsa: user.rsa,
          masterKey: user.masterKey,
          region: user.region,
          street: user.street
        });
        return shops;
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
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
    return bfast.cache({database: 'stocks', collection: 'stocks'}, shop.projectId).set('all', products);
  }

  async setSalesLocal(batchs: BatchModel[], shop: ShopModel, cartId: string) {
    if (batchs?.length === 0) {
      return;
    }
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).set(cartId, batchs);
  }

  async getSalesLocal(shop: ShopModel) {
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).getAll();
  }

  async getSaleLocal(id: string, shop: ShopModel): Promise<any[]> {
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).get(id);
  }

  async getSalesLocalKeys(shop: ShopModel) {
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).keys();
  }

  async removeSalesLocal(cartId: string, shop: ShopModel) {
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).remove(cartId, true);
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

  stocksListeningStop(shop) {
  }

  async getProducts(shop: ShopModel): Promise<StockModel[]> {
    const products = await this.getProductsLocal(shop);
    return products.filter(x => x.saleable);
  }

  async saveSale(sales: SalesModel[], shop: ShopModel, cartId: string): Promise<any> {
    const batchs = sales.map<BatchModel>(sale => {
      sale.cartId = cartId;
      sale.createdAt = new Date();
      sale.batch = SecurityUtil.generateUUID();
      return {
        method: 'POST',
        body: sale,
        path: '/classes/sales'
      };
    });
    await this.setSalesLocal(batchs, shop, cartId);
  }

  private async saveSaleRemote(): Promise<string> {
    const shops = await SaleWorker.getShops();
    for (const shop of shops) {
      bfast.init({
        applicationId: shop.applicationId,
        projectId: shop.projectId,
        adapters: {
          auth: 'DEFAULT'
        }
      }, shop.projectId);
      const salesKeys: string[] = await this.getSalesLocalKeys(shop);
      // const sales: Array<BatchModel[]> = await this.getSalesLocal(shop); // bfast.cache({database: 'sales', collection: shop.projectId});
      // console.log(sales);
      if (salesKeys && Array.isArray(salesKeys) && salesKeys.length > 0) {
        for (const key of salesKeys) {
          const sale: BatchModel[] = await this.getSaleLocal(key, shop);
          if (sale && Array.isArray(sale) && sale.length > 0) {
            // console.log(sale);
            await bfast.functions(shop.projectId)
              .request(`https://${shop.projectId}-daas.bfast.fahamutech.com/functions/sales`)
              .post({
                requests: sale
              });
            await this.removeSalesLocal(key, shop);
          }
          // else {
          //   await this.removeSalesLocal(sale[0].cartId, shop);
          // }
        }
      }
    }
    return 'Done';
  }

  private syncSales() {
    // if (SaleWorker.shouldSaleSyncInit) {
    //   // console.log('order sync running');
    //   return;
    // }
    // const id = Math.random();
    // this.shouldSaleSyncInit = false;
    console.log('sales sync started');
    setInterval(_ => {
      // console.log(id, '******');
      if (this.shouldSaleSync === true) {
        this.shouldSaleSync = false;
        this.saveSaleRemote()
          .then(_1 => {
          })
          .catch(_2 => {
            console.log(_2);
          })
          .finally(() => {
            this.shouldSaleSync = true;
          });
      } else {
        // console.log('another save sales routine run');
      }
    }, 3000);
  }

  async getProductsRemote(shop: ShopModel): Promise<StockModel[]> {
    const localProducts = await this.getProductsLocal(shop);
    const hashesMap = await SaleWorker.productsLocalHashMap(localProducts);
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
    return stocks.filter(x => {
      return x.saleable && x?.product?.toLowerCase().includes(query.toLowerCase());
    });
  }

}

expose(SaleWorker);
