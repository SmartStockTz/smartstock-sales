import { Injectable } from '@angular/core';
import { SecurityUtil, ShopModel, UserService } from 'smartstock-core';
import { OrderModel } from '../models/order.model';
import { CustomerModel } from '../models/customer.model';
import { OrdersWorker } from '../workers/orders.worker';
import { wrap } from 'comlink';
import { CartItemModel } from '../models/cart-item.model';
import { cache, database, functions } from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private readonly userService: UserService) {}

  private static async withWorker(
    fn: (ordersWorker: OrdersWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL('../workers/orders.worker', import .meta.url)
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

  private async remoteAllOrders(shop: any): Promise<OrderModel[]> {
    return database(shop.projectId).table('orders').getAll();
  }

  async saveOrder(
    id: string,
    carts: CartItemModel[],
    channel: string,
    selectedCustomer: CustomerModel,
    user: any
  ): Promise<any> {
    if (!selectedCustomer || !selectedCustomer?.displayName) {
      throw { message: 'Please select a customer to save the order' };
    }
    const shop = await this.userService.getCurrentShop();
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
      total: await OrderService.withWorker((ordersWorker) =>
        ordersWorker.findOrderTotal(carts, channel)
      ),
      shipping: {
        mobile: selectedCustomer?.phone,
        location: selectedCustomer?.street
      }
    };
    await database(shop.projectId).table('orders').save(order);
    await cache({ database: shop.projectId, collection: 'orders' }).set(
      order.id,
      order
    );
    return order;
  }

  private async ordersFromSyncs(shop: ShopModel): Promise<OrderModel[]> {
    return cache({ database: shop.projectId, collection: 'orders' })
      .getAll()
      .then((orders) => {
        if (Array.isArray(orders) && orders.length > 0) {
          return orders;
        }
        return this.getRemoteOrders().then((rO) => {
          cache({ database: shop.projectId, collection: 'orders' })
            .setBulk(
              rO.map((x) => x.id),
              rO
            )
            .catch(console.log);
          return rO;
        });
      });
  }

  async getOrders(): Promise<OrderModel[]> {
    const shop = await this.userService.getCurrentShop();
    const c = await this.ordersFromSyncs(shop);
    return OrderService.withWorker((ordersWorker) =>
      ordersWorker.sortOrders(c)
    );
  }

  async getRemoteOrders(): Promise<OrderModel[]> {
    const shop = await this.userService.getCurrentShop();
    const orders = await this.remoteAllOrders(shop);
    return OrderService.withWorker((ordersWorker) =>
      ordersWorker.sortOrders(orders)
    );
  }

  async markOrderIsPaid(orderId: string): Promise<any> {
    return database()
      .collection('orders')
      .query()
      .byId(orderId)
      .updateBuilder()
      .set('paid', true)
      .update();
  }

  async checkOrderIsPaid(order: string): Promise<any> {
    const payments = await functions('fahamupay')
      .request(`/functions/pay/check/${order}`)
      .get<any[]>();
    return payments
      .map((x) => Math.round(Number(x.amount)))
      .reduce((a, b) => a + b, 0);
  }

  async search(query: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const o = await this.ordersFromSyncs(shop);
    return OrderService.withWorker((ordersWorker) =>
      ordersWorker.search(query, o, shop)
    );
  }

  async deleteOrder(order: OrderModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId)
      .table('orders')
      .query()
      .byId(order.id)
      .delete();
    cache({ database: shop.projectId, collection: 'orders' })
      .remove(order.id)
      .catch(console.log);
    return order;
  }
}
