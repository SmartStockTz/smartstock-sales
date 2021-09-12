import {expose} from 'comlink';
import * as bfast from 'bfast';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';
import {BatchModel} from '../models/batch.model';
import {SecurityUtil} from '@smartstocktz/core-libs';
import {SalesModel} from '../models/sale.model';
import {StockSyncModel} from '../models/stock-sync.model';

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

  constructor(shop: ShopModel) {
    init(shop);
    this.syncSales();
  }

  shouldSaleSync = true;

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

  private async productsLocalSyncMap(shop: ShopModel): Promise<{ [key: string]: StockSyncModel }> {
    init(shop);
    const productsMap: { [key: string]: StockSyncModel } = await bfast
      .cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      .get('all');
    if (
      productsMap &&
      !Array.isArray(productsMap) &&
      Array.isArray(Object.values(productsMap))
    ) {
      return productsMap;
    } else {
      return {};
    }
  }


  private async productsLocalMap(shop: ShopModel): Promise<{ [key: string]: StockModel }> {
    init(shop);
    const productsSyncMap = await this.productsLocalSyncMap(shop);
    const productsMap: { [key: string]: StockModel } = await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .get('all');
    if (
      productsMap &&
      !Array.isArray(productsMap) &&
      Array.isArray(Object.values(productsMap))
    ) {
      Object.keys(productsMap).forEach(k => {
        if (productsSyncMap[k]?.action === 'delete') {
          delete productsMap[k];
        }
      });
      return productsMap;
    } else {
      return {};
    }
  }

  async getProductLocal(id: string, shop: ShopModel): Promise<StockModel> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    return productsMap[id];
  }

  async getProductsLocal(shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    return Object.values(productsMap).sort((a, b) => {
      if (a?.product?.toString() > b?.product?.toString()) {
        return 1;
      } else if (a?.product?.toString() < b?.product?.toString()) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  async removeProductLocal(product: StockModel, shop: ShopModel): Promise<string> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    delete productsMap[product.id];
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return product.id;
  }

  async removeProductsLocal(products: StockModel[], shop: ShopModel): Promise<string[]> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    products.forEach(x => {
      delete productsMap[x.id];
    });
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return products.map(x => x.id);
  }

  async setProductLocal(product: StockModel, shop: ShopModel): Promise<StockModel> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    productsMap[product.id] = product;
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return product;
  }

  async setProductsLocal(products: StockModel[], shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    let productsMap = await this.productsLocalMap(shop);
    productsMap = products.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, productsMap);
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return products;
  }

  async setSalesLocal(batchs: BatchModel[], shop: ShopModel, cartId: string): Promise<any> {
    if (batchs?.length === 0) {
      return;
    }
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).set(cartId, batchs);
  }

  async getSalesLocal(shop: ShopModel) {
    init(shop);
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId)
      .getAll();
  }

  async getSaleLocal(id: string, shop: ShopModel): Promise<any[]> {
    init(shop);
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).get(id);
  }

  async getSalesLocalKeys(shop: ShopModel) {
    init(shop);
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).keys();
  }

  async removeSalesLocal(cartId: string, shop: ShopModel) {
    init(shop);
    return bfast.cache({database: 'sales', collection: 'sales'}, shop.projectId).remove(cartId, true);
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
    init(shop);
    const products = await this.getProductsLocal(shop);
    return products.filter(x => x.saleable);
  }

  async saveSale(sales: SalesModel[], shop: ShopModel, cartId: string): Promise<any> {
    init(shop);
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

  async getProductsRemote(shop: ShopModel, products: StockModel[]): Promise<StockModel[]> {
    init(shop);
    const localProducts = await this.getProductsLocal(shop);
    if (!products) {
      products = localProducts;
      console.log('no remote hence use local products');
    }
    await this.setProductsLocal(products, shop);
    return await this.getProductsLocal(shop);
  }

  async search(query: string, shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const stocks = await this.getProductsLocal(shop);
    return stocks.filter(x => {
      return (x?.saleable === true) && (x?.product?.toString()?.toLowerCase().includes(query?.toLowerCase()));
    });
  }

}

expose(SaleWorker);
