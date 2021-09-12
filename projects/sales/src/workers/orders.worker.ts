import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import * as bfast from 'bfast';
import {CartItemModel} from '../models/cart-item.model';
import {CustomerModel} from '../models/customer.model';
import {OrderSyncModel} from '../models/order-sync.model';
import {OrderModel} from '../models/order.model';
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

  constructor(private readonly shop: ShopModel) {
    init(this.shop);
    this.syncOrders(this.shop).catch(console.log);
    this.listeningOrders(this.shop).catch(console.log);
  }

  private syncInterval;
  private changes;

  private setOrderSyncLocal(order: OrderSyncModel, shop): Promise<OrderSyncModel> {
    return bfast.cache({database: 'orders', collection: 'orders_sync'}, shop.projectId).set(order.order.id, order);
  }

  private async removeOrderLocalSync(order: OrderSyncModel, shop: ShopModel) {
    return bfast.cache({database: 'orders', collection: 'orders_sync'}, shop.projectId).remove(order.order.id, true);
  }

  private async getOrdersLocalSync(shop: ShopModel): Promise<OrderSyncModel[]> {
    return bfast.cache({database: 'orders', collection: 'orders_sync'}, shop.projectId).getAll();
  }

  async listeningOrders(shop: ShopModel): Promise<any> {
    this.changes = bfast.database(shop.projectId)
      .table('orders')
      .query()
      .changes(() => {
        console.log('orders changes connected');
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
    const orders: OrderModel[] = await bfast
      .cache({database: 'orders', collection: 'orders'}, shop.projectId)
      .get('all');
    const ordersInSync = await this.getOrdersLocalSync(shop);
    if (Array.isArray(orders)) {
      return orders.filter(x => {
        return ordersInSync.findIndex(value => {
          return value.order.id === x.id && value.action === 'delete';
        }) === -1;
      });
    } else {
      return [];
    }
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
      const orders: OrderSyncModel[] = await this.getOrdersLocalSync(shop);
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
            await this.removeOrderLocalSync(order, shop);
          } catch (e) {
            console.log(e);
          }
        }
        isRunn = false;
      }
    }, 2000);
  }

  async saveOrder(
    id: string,
    carts: CartItemModel[],
    customer: CustomerModel,
    channel: string,
    user: any,
    shop: ShopModel
  ) {
    const orderSync: OrderSyncModel = {
      action: 'upsert',
      order: {
        id: id ? id : SecurityUtil.generateUUID(),
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
    const order = await this.setOrderSyncLocal(orderSync, shop);
    this.syncOrders(shop).catch(console.log);
    return order.order;
  }

  async getOrdersRemote(shop: ShopModel, rOrders: OrderModel[]): Promise<OrderModel[]> {
    const localOrders = await this.getOrdersLocal(shop);
    if (!rOrders) {
      rOrders = localOrders;
    }
    await this.setOrdersLocal(rOrders, shop);
    return rOrders.sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      } else if (a.createdAt < b.createdAt) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  async getOrders(shop: ShopModel): Promise<CustomerModel[]> {
    const orders: any[] = await this.getOrdersLocal(shop);
    if (Array.isArray(orders) && orders.length !== 0) {
      return orders.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        } else if (a.createdAt < b.createdAt) {
          return 1;
        } else {
          return 0;
        }
      });
    } else {
      return [];
    }
  }

  async search(query: string, shop: ShopModel): Promise<any> {
    const localOrders: any[] = await this.getOrdersLocal(shop);
    if (Array.isArray(localOrders)) {
      return localOrders.filter(y => JSON.stringify(y).toLowerCase().includes(query.toLowerCase()));
    } else {
      return [];
    }
  }

  async deleteOrder(order: OrderModel, shop: ShopModel): Promise<any> {
    await this.setOrderSyncLocal({
      order,
      action: 'delete'
    }, shop);
    await this.removeOrderLocal(order.id, shop);
    this.syncOrders(shop).catch(console.log);
  }
}

expose(OrdersWorker);
