import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {bfast} from 'bfastjs';
import {CartItemModel} from '../models/cart-item.model';
import {CustomerModel} from '../models/customer.model';
import {OrderSyncModel} from '../models/order-sync.model';
import {OrderModel} from '../models/order.model';
import {sha256} from 'crypto-hash';
import {SecurityUtil} from '@smartstocktz/core-libs';

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

export class OrdersWorker {

  constructor(shop: ShopModel) {
    init(shop);
    this.syncOrders(shop).catch(console.log);
    this.listeningOrders(shop).catch(console.log);
  }

  private syncInterval;
  private remoteAllOrdersRunning = false;
  private changes;

  private static async orderLocalHashMap(localOrders: any[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(localOrders)) {
      for (const localC of localOrders) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
  }

  private static setOrderSyncLocal(order: OrderSyncModel, shop): Promise<OrderSyncModel> {
    return bfast.cache({database: 'orders', collection: 'orders_sync'}, shop.projectId).set(order.order.id, order);
  }

  private static async removeOrderLocalSync(order: OrderModel, shop: ShopModel) {
    return bfast.cache({database: 'orders', collection: 'orders_sync'}, shop.projectId).remove(order.id, true);
  }

  private static async getOrdersLocalSync(shop: ShopModel): Promise<OrderSyncModel[]> {
    return bfast.cache({database: 'orders', collection: 'orders_sync'}, shop.projectId).getAll();
  }

  async listeningOrders(shop: ShopModel): Promise<any> {
    this.changes = bfast.database(shop.projectId)
      .table('orders')
      .query()
      .changes(() => {
        console.log('orders changes connected');
        this.getOrdersRemote(shop).catch(console.log);
      }, () => {
        console.log('orders changes disconnected');
      });
    this.changes.addListener(async response => {
      if (response && response.body && response.body.change) {
        // console.log(response.body.change);
        if (response.body.change.name === 'create') {
          this.setOrderLocal(response.body.change.snapshot, shop).catch(console.log);
        } else if (response.body.change.name === 'update') {
          this.setOrderLocal(response.body.change.snapshot, shop).catch(console.log);
        } else if (response.body.change.name === 'delete') {
          await this.removeOrderLocal(response.body.change.snapshot.id, shop);
        } else {
        }
      }
    });
  }

  async listeningOrdersStop() {
    this.changes?.close();
  }

  async setOrderLocal(order: OrderModel, shop): Promise<OrderModel[]> {
    let orders = await this.getOrdersLocal(shop);
    let update = false;
    orders = orders.map(x => {
      if (x.id === order.id) {
        update = true;
        return order;
      } else {
        return x;
      }
    });
    if (update === false) {
      orders.push(order);
    }
    return this.setOrdersLocal(orders, shop);
  }

  async setOrdersLocal(orders: OrderModel[], shop): Promise<OrderModel[]> {
    return bfast.cache({database: 'orders', collection: 'orders'}, shop.projectId).set('all', orders);
  }

  async removeOrderLocal(id: string, shop: ShopModel): Promise<OrderModel[]> {
    const orders = await this.getOrdersLocal(shop);
    return this.setOrdersLocal(orders.filter(x => x.id !== id), shop);
  }

  async getOrdersLocal(shop): Promise<OrderModel[]> {
    const order: OrderModel[] = await bfast.cache({database: 'orders', collection: 'orders'}, shop.projectId).get('all');
    if (Array.isArray(order)) {
      return order;
    } else {
      return [];
    }
  }

  private async remoteAllOrders(shop: ShopModel, hashes: any[] = []): Promise<OrderModel[]> {
    this.remoteAllOrdersRunning = true;
    return bfast.database(shop.projectId)
      .collection('orders')
      .getAll<CustomerModel>({
        hashes
      }).finally(() => {
        this.remoteAllOrdersRunning = false;
      });
  }

  private remoteOrdersMapping(orders: OrderModel[], hashesMap): OrderModel[] {
    if (Array.isArray(orders)) {
      orders = orders.map(x => {
        if (hashesMap[x.toString()]) {
          return hashesMap[x.toString()];
        } else {
          return x;
        }
      });
    }
    return orders;
  }

  async findOrderTotal(carts: CartItemModel[], channel: string): Promise<number> {
    return carts.map<number>(value => {
      let quantity;
      let price;
      if (channel === 'retail') {
        quantity = value.quantity;
        price = value.product.retailPrice;
      } else if (channel === 'whole') {
        quantity = value.quantity;
        price = value.product.wholesalePrice;
      } else {
        quantity = value.quantity;
        price = value.product.retailPrice;
      }
      return quantity * price;
    }).reduce((a, b) => {
      return a + b;
    }, 0);
  }

  private async syncOrders(shop: ShopModel) {
    let isRunn = false;
    if (this.syncInterval) {
      // console.log('order sync running');
      return;
    }
    console.log('order sync start');
    this.syncInterval = setInterval(async () => {
      if (isRunn === true) {
        return;
      }
      isRunn = true;
      const orders: OrderSyncModel[] = await OrdersWorker.getOrdersLocalSync(shop);
      // console.log(orders, '*****');
      if (Array.isArray(orders) && orders.length === 0) {
        isRunn = false;
        clearInterval(this.syncInterval);
        this.syncInterval = undefined;
        console.log('orders sync stop');
      } else {
        for (const order of orders) {
          try {
            if (order.action === 'upsert') {
              await bfast.database(shop.projectId)
                .table('orders')
                .query()
                .byId(order.order.id)
                .updateBuilder()
                .doc(order.order)
                .upsert(true)
                .update();
            } else if (order.action === 'delete') {
              await bfast.database(shop.projectId)
                .table('orders')
                .query()
                .byId(order.order.id)
                .delete();
            }
            // console.log(order);
            await OrdersWorker.removeOrderLocalSync(order.order, shop);
          } catch (e) {
            console.log(e);
          }
        }
        isRunn = false;
      }
    }, 2000);
  }

  async saveOrder(
    carts: CartItemModel[],
    customer: CustomerModel,
    channel: string,
    user: any,
    shop: ShopModel
  ) {
    const orderSync: OrderSyncModel = {
      action: 'upsert',
      order: {
        id: SecurityUtil.generateUUID(),
        createdAt: new Date(),
        channel: channel ? channel : 'retail',
        customer,
        items: carts,
        date: new Date(),
        status: 'PROCESSED',
        paid: false,
        orderRef: null,
        placedBy: {
          firstname: user?.firstname,
          username: user?.username,
          lastname: user?.lastname
        },
        total: await this.findOrderTotal(carts, channel),
        shipping: {
          mobile: customer.phone,
          location: customer.street
        }
      }
    };
    await this.setOrderLocal(orderSync.order, shop);
    const order = await OrdersWorker.setOrderSyncLocal(orderSync, shop);
    this.syncOrders(shop).catch(console.log);
    return order.order;
  }

  async getOrdersRemote(shop: ShopModel): Promise<CustomerModel[]> {
    const localOrders = await this.getOrdersLocal(shop);
    const hashesMap = await OrdersWorker.orderLocalHashMap(localOrders);
    let orders = [];
    try {
      orders = await this.remoteAllOrders(shop, Object.keys(hashesMap));
      orders = this.remoteOrdersMapping(orders, hashesMap);
    } catch (e) {
      console.log(e);
      orders = localOrders;
    }
    await this.setOrdersLocal(orders, shop);
    return orders;
  }

  async getOrders(shop: ShopModel): Promise<CustomerModel[]> {
    const models: any[] = await this.getOrdersLocal(shop);
    if (Array.isArray(models) && models.length !== 0) {
      return models;
    } else {
      return this.getOrdersRemote(shop);
    }
  }

}

expose(OrdersWorker);
