import {Injectable} from '@angular/core';
import {getDaasAddress, SecurityUtil, toSqlDate, UserService} from '@smartstocktz/core-libs';
import {OrderModel} from '../models/order.model';
import {CustomerModel} from '../models/customer.model';
import {OrdersWorker} from '../workers/orders.worker';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {CartItemModel} from '../models/cart-item.model';
import {cache, database, functions} from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersWorker: OrdersWorker;
  private ordersWorkerNative;

  constructor(private readonly userService: UserService) {
  }

  async startWorker(shop: ShopModel) {
    if (!this.ordersWorker) {
      this.ordersWorkerNative = new Worker(new URL('../workers/orders.worker', import .meta.url));
      const SW = wrap(this.ordersWorkerNative) as unknown as any;
      this.ordersWorker = await new SW(shop);
    }
  }

  // stopWorker() {
  //   if (this.ordersWorkerNative) {
  //     this.ordersWorkerNative.terminate();
  //     this.ordersWorker = undefined;
  //     this.ordersWorkerNative = undefined;
  //   }
  // }

  private async remoteAllOrders(shop: ShopModel): Promise<OrderModel[]> {
    return database(shop.projectId).table('orders').getAll();
  }

  // async customerListeningStop(): Promise<void> {
  //   if (this.changes && this.changes.close) {
  //     this.changes.close();
  //   }
  // }
  //
  // async customerListening(): Promise<void> {
  //   const shop = await this.userService.getCurrentShop();
  //   this.changes = functions(shop.projectId).event(
  //     '/daas-changes',
  //     () => {
  //       console.log('connected on customers changes');
  //       this.changes.emit({
  //         auth: {
  //           masterKey: shop.masterKey
  //         },
  //         body: {
  //           projectId: shop.projectId,
  //           applicationId: shop.applicationId,
  //           pipeline: [],
  //           domain: 'customers'
  //         }
  //       });
  //     },
  //     () => console.log('disconnected on customers changes')
  //   );
  //   this.changes.listener(async response => {
  //     console.log(response);
  //     const customerCache = cache({database: shop.projectId, collection: 'customers'});
  //     if (response && response.body && response.body.change) {
  //       switch (response.body.change.name) {
  //         case 'create':
  //           const data = response.body.change.snapshot;
  //           await customerCache.set(data.id, data);
  //           return;
  //         case 'update':
  //           let updateData = response.body.change.snapshot;
  //           const oldData = await customerCache.get(updateData.id);
  //           updateData = Object.assign(typeof oldData === 'object' ? oldData : {}, updateData);
  //           await customerCache.set(updateData.id, updateData);
  //           return;
  //         case 'delete':
  //           const deletedData = response.body.change.snapshot;
  //           await customerCache.remove(deletedData.id);
  //           return;
  //       }
  //     }
  //   });
  // }

  async saveOrder(
    id: string, carts: CartItemModel[], channel: string, selectedCustomer: CustomerModel, user: any
  ): Promise<any> {
    if (!selectedCustomer || !selectedCustomer?.displayName) {
      throw {message: 'Please select a customer to save the order'};
    }
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const order = {
      id: id ? id : SecurityUtil.generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channel: channel ? channel : 'retail',
      customer: selectedCustomer,
      items: carts,
      date: new Date().toISOString(),
      status: 'PROCESSED',
      paid: false,
      orderRef: null,
      placedBy: {
        firstname: user?.firstname,
        username: user?.username,
        lastname: user?.lastname
      },
      total: await this.ordersWorker.findOrderTotal(carts, channel),
      shipping: {
        mobile: selectedCustomer?.phone,
        location: selectedCustomer?.street
      }
    };
    await database(shop.projectId).table('orders').save(order);
    await cache({database: shop.projectId, collection: 'orders'}).set(order.id, order);
    return order;
  }

  private async ordersFromSyncs(shop: ShopModel): Promise<OrderModel[]> {
    return cache({database: shop.projectId, collection: 'orders'}).getAll().then(orders => {
      if (Array.isArray(orders) && orders.length > 0) {
        return orders;
      }
      return this.getRemoteOrders().then(rO => {
        cache({database: shop.projectId, collection: 'orders'}).setBulk(rO.map(x => x.id), rO).catch(console.log);
        return rO;
      });
    });
  }

  async getOrders(): Promise<OrderModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const c = await this.ordersFromSyncs(shop);
    return this.ordersWorker.sortOrders(c);
  }

  async getRemoteOrders(): Promise<OrderModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const orders = await this.remoteAllOrders(shop);
    return this.ordersWorker.sortOrders(orders);
  }

  async markOrderIsPaid(orderId: string): Promise<any> {
    return database().collection('orders').query().byId(orderId).updateBuilder().set('paid', true).update();
  }

  // async markAsCompleted(order: OrderModel): Promise<any> {
  //   const shop = await this.userService.getCurrentShop();
  //   return database(shop.projectId).bulk()
  //     .update('orders', {
  //       query: {
  //         id: order.id,
  //       },
  //       update: {
  //         $set: {
  //           paid: true,
  //           status: 'COMPLETED'
  //         }
  //       }
  //     })
  //     .create('sales', order.items.map(x => {
  //       const quantity = x.quantity;
  //       return {
  //         amount: quantity * x.product.retailPrice,
  //         discount: 0,
  //         quantity,
  //         product: x.product.product,
  //         category: x.product.category,
  //         unit: x.product.unit,
  //         channel: 'online',
  //         date: toSqlDate(new Date()),
  //         idTra: 'n',
  //         user: 'online',
  //         batch: SecurityUtil.generateUUID(),
  //         stockId: x.product.id
  //       };
  //     }))
  //     .update('stocks', order.items
  //       .filter(x => x.product.stockable === true)
  //       .map(y => {
  //         return {
  //           query: {
  //             id: y.product.id,
  //           },
  //           update: {
  //             $inc: {
  //               quantity: -Number(y.quantity),
  //             }
  //           }
  //         };
  //       })).commit();
  // }

  async checkOrderIsPaid(order: string): Promise<any> {
    const payments = await functions('fahamupay')
      .request(`/functions/pay/check/${order}`)
      .get<any[]>();
    return payments.map(x => Math.round(Number(x.amount))).reduce((a, b) => a + b, 0);
  }

  // async markOrderAsCancelled(order: OrderModel): Promise<any> {
  //   const shop = await this.userService.getCurrentShop();
  //   return database(shop.projectId).collection('orders')
  //     .query()
  //     .byId(order.id)
  //     .updateBuilder()
  //     .set('status', 'CANCELLED')
  //     .update();
  // }

  // async markAsProcessed(order: OrderModel): Promise<any> {
  //   const shop = await this.userService.getCurrentShop();
  //   return database(shop.projectId).collection('orders')
  //     .query()
  //     .byId(order.id)
  //     .updateBuilder()
  //     .set('status', 'PROCESSED')
  //     .update();
  // }

  // private async setOrderLocal(snapshot: OrderModel) {
  //   const shop = await this.userService.getCurrentShop();
  //   await this.startWorker(shop);
  //   return this.ordersWorker.setOrderLocal(snapshot, shop);
  // }
  //
  // private async removeOrderLocal(snapshot: OrderModel) {
  //   const shop = await this.userService.getCurrentShop();
  //   await this.startWorker(shop);
  //   return this.ordersWorker.removeOrderLocal(snapshot.id, shop);
  // }

  async search(query: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const o = await this.ordersFromSyncs(shop);
    return this.ordersWorker.search(query, o, shop);
  }

  async deleteOrder(order: OrderModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    // await this.startWorker(shop);
    await database(shop.projectId).table('orders').query().byId(order.id).delete();
    cache({database: shop.projectId, collection: 'orders'}).remove(order.id).catch(console.log);
    return order;
    // return this.ordersWorker.deleteOrder(order, shop);
  }
}
