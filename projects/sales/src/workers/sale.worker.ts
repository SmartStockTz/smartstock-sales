import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';
import {BatchModel} from '../models/batch.model';
import {getDaasAddress, getFaasAddress, SecurityUtil} from '@smartstocktz/core-libs';
import {SalesModel} from '../models/sale.model';
import {auth, cache, database, init} from 'bfast';

function init_(shop: ShopModel) {
  init({
    applicationId: 'smartstock_lb',
    projectId: 'smartstock'
  });
  init({
    applicationId: shop.applicationId,
    projectId: shop.projectId,
    adapters: {
      auth: 'DEFAULT'
    },
    databaseURL: getDaasAddress(shop),
    functionsURL: getFaasAddress(shop),
  }, shop.projectId);
}

export class SaleWorker {

  constructor(shop: ShopModel) {
    init_(shop);
    this.syncSales();
  }

  shouldSaleSync = true;

  private static async getShops() {
    try {
      init({
        applicationId: 'smartstock_lb',
        projectId: 'smartstock'
      });
      const user = await auth().currentUser();
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
      console.log(e);
      return [];
    }
  }

  async setSalesLocal(batchs: BatchModel[], shop: ShopModel, cartId: string): Promise<any> {
    if (batchs?.length === 0) {
      return;
    }
    return cache({database: 'sales', collection: 'sales'}, shop.projectId).set(cartId, batchs);
  }

  async getSalesLocal(shop: ShopModel) {
    init(shop);
    return cache({database: 'sales', collection: 'sales'}, shop.projectId)
      .getAll();
  }

  async getSaleLocal(id: string, shop: ShopModel): Promise<any[]> {
    init(shop);
    return cache({database: 'sales', collection: 'sales'}, shop.projectId).get(id);
  }

  async getSalesLocalKeys(shop: ShopModel) {
    init(shop);
    return cache({database: 'sales', collection: 'sales'}, shop.projectId).keys();
  }

  async removeSalesLocal(cartId: string, shop: ShopModel) {
    init(shop);
    return cache({database: 'sales', collection: 'sales'}, shop.projectId).remove(cartId, true);
  }

  // private remoteProductsMapping(products: StockModel[], hashesMap): StockModel[] {
  //   if (Array.isArray(products)) {
  //     products = products.map(x => {
  //       if (hashesMap[x.toString()]) {
  //         return hashesMap[x.toString()];
  //       } else {
  //         return x;
  //       }
  //     });
  //   }
  //   return products;
  // }

  stocksListeningStop(shop) {
  }

  async filterSaleableProducts(products: StockModel[], shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    // const products = await this.getProductsLocal(shop);
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

  validBody(body) {
    if (body && body.requests && Array.isArray(body.requests)) {
      return body.requests.reduce((a, x) => {
        return (
          a &&
          x.body?.hasOwnProperty('amount') &&
          x.body?.hasOwnProperty('discount') &&
          x.body?.hasOwnProperty('quantity') &&
          x.body?.hasOwnProperty('product') &&
          x.body?.hasOwnProperty('category') &&
          x.body?.hasOwnProperty('unit') &&
          x.body?.hasOwnProperty('channel') &&
          x.body?.hasOwnProperty('date') &&
          x.body?.hasOwnProperty('batch') &&
          x.body?.hasOwnProperty('cartId') &&
          x.body?.hasOwnProperty('stockId') &&
          x.body?.hasOwnProperty('stock')
        );
      }, true);
    } else {
      return false;
    }
  }

  async saleTransaction(sales, shop) {
    let salesToSave = sales.map((value) => {
      delete value.body?.id;
      delete value.body?._id;
      if (value && value.body && value.body.sellerObject) {
        value.body.sellerObject = {
          username: value.body.sellerObject.username,
          lastname: value.body.sellerObject.lastname,
          firstname: value.body.sellerObject.firstname,
          email: value.body.sellerObject.email,
        };
      }
      value.body.id = value.body?.batch;
      return value.body;
    });
    salesToSave = salesToSave.filter(x => {
      return !!(
        x.hasOwnProperty('amount') &&
        x.hasOwnProperty('discount') &&
        x.hasOwnProperty('quantity') &&
        x.hasOwnProperty('product') &&
        x.hasOwnProperty('category') &&
        x.hasOwnProperty('unit') &&
        x.hasOwnProperty('channel') &&
        x.hasOwnProperty('date') &&
        x.hasOwnProperty('batch') &&
        x.hasOwnProperty('cartId') &&
        x.hasOwnProperty('stockId') &&
        x.hasOwnProperty('stock')
      );
    });
    if (salesToSave && Array.isArray(salesToSave) && salesToSave.length > 0) {
      await database(shop.projectId)
        .bulk()
        .create('sales', salesToSave)
        .update(
          'stocks',
          salesToSave
            .filter((x) => x && x.stock.stockable && x.stock.stockable === true)
            .map((y) => {
              return {
                query: {
                  id: y.stockId,
                },
                update: {
                  $inc: {
                    quantity: -Number(y.quantity),
                  },
                },
              };
            })
        )
        .commit();
    }
    return {message: 'Done save sales and update stocks'};
  }

  private async saveSaleRemote(): Promise<string> {
    const shops = await SaleWorker.getShops();
    for (const shop of shops) {
      init({
        applicationId: shop.applicationId,
        projectId: shop.projectId,
        adapters: {
          auth: 'DEFAULT'
        },
        databaseURL: getDaasAddress(shop),
        functionsURL: getFaasAddress(shop),
      }, shop.projectId);
      const salesKeys: string[] = await this.getSalesLocalKeys(shop);
      // const sales: Array<BatchModel[]> = await this.getSalesLocal(shop); // bfast.cache({database: 'sales', collection: shop.projectId});
      // console.log(sales);
      if (salesKeys && Array.isArray(salesKeys) && salesKeys.length > 0) {
        for (const key of salesKeys) {
          const sale: BatchModel[] = await this.getSaleLocal(key, shop);
          if (sale && Array.isArray(sale) && sale.length > 0) {
            // console.log(sale);
            if (this.validBody({requests: sale})) {
              await this.saleTransaction(sale, shop);
              await this.removeSalesLocal(key, shop);
            } else {
              throw {message: 'Invalid sales data'};
            }
          }
          console.log('save and remove sales');
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
        console.log('another save sales routine run');
      }
    }, 2000);
  }

  // async getProductsRemote(shop: ShopModel, products: StockModel[]): Promise<StockModel[]> {
  //   init(shop);
  //   const localProducts = await this.getProductsLocal(shop);
  //   if (!products) {
  //     products = localProducts;
  //     console.log('no remote hence use local products');
  //   }
  //   await this.setProductsLocal(products, shop);
  //   return await this.getProductsLocal(shop);
  // }

  async search(stocks: StockModel[], query: string, shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    // const stocks = await this.getProductsLocal(shop);
    return stocks.filter(x => {
      return (x?.saleable === true) && (x?.product?.toString()?.toLowerCase().includes(query?.toLowerCase()));
    });
  }

}

expose(SaleWorker);
