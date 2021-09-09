import {Injectable} from '@angular/core';
import {SecurityUtil, toSqlDate, UserService} from '@smartstocktz/core-libs';
import * as bfast from 'bfast';
import {OrderModel} from '../models/order.model';
import {CustomerModel} from '../models/customer.model';
import {OrdersWorker} from '../workers/orders.worker';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {wrap} from 'comlink';
import {CartItemModel} from '../models/cart-item.model';

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

  stopWorker() {
    if (this.ordersWorkerNative) {
      this.ordersWorkerNative.terminate();
      this.ordersWorker = undefined;
      this.ordersWorkerNative = undefined;
    }
  }

  async saveOrder(
    id: string,
    carts: CartItemModel[],
    channel: string,
    selectedCustomer: CustomerModel,
    user: any
  ): Promise<any> {
    if (!selectedCustomer || !selectedCustomer?.displayName) {
      throw {message: 'Please select a customer to save the order'};
    }
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.saveOrder(
      id,
      carts,
      selectedCustomer,
      channel,
      user,
      shop
    );
  }

  async getOrders(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.getOrders(shop);
  }

  async getRemoteOrders(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.getOrdersRemote(shop);
  }

  async markOrderIsPaid(orderId: string): Promise<any> {
    return bfast.database().collection('orders')
      .query()
      .byId(orderId)
      .updateBuilder()
      .set('paid', true)
      .update();
  }

  async markAsCompleted(order: OrderModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return bfast.database(shop.projectId).bulk()
      .update('orders', {
        query: {
          id: order.id,
        },
        update: {
          $set: {
            paid: true,
            status: 'COMPLETED'
          }
        }
      })
      .create('sales', order.items.map(x => {
        const quantity = x.quantity;
        return {
          amount: quantity * x.product.retailPrice,
          discount: 0,
          quantity,
          product: x.product.product,
          category: x.product.category,
          unit: x.product.unit,
          channel: 'online',
          date: toSqlDate(new Date()),
          idTra: 'n',
          user: 'online',
          batch: SecurityUtil.generateUUID(),
          stockId: x.product.id
        };
      }))
      .update('stocks', order.items
        .filter(x => x.product.stockable === true)
        .map(y => {
          return {
            query: {
              id: y.product.id,
            },
            update: {
              $inc: {
                quantity: -Number(y.quantity),
              }
            }
          };
        })).commit();
  }

  async checkOrderIsPaid(order: string): Promise<any> {
    const payments = await bfast.functions('fahamupay')
      .request(`/functions/pay/check/${order}`)
      .get<any[]>();
    return payments.map(x => Math.round(Number(x.amount))).reduce((a, b) => a + b, 0);
  }

  async markOrderAsCancelled(order: OrderModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();

    return bfast.database(shop.projectId).collection('orders')
      .query()
      .byId(order.id)
      .updateBuilder()
      .set('status', 'CANCELLED')
      .update();
  }

  async markAsProcessed(order: OrderModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();

    return bfast.database(shop.projectId).collection('orders')
      .query()
      .byId(order.id)
      .updateBuilder()
      .set('status', 'PROCESSED')
      .update();
  }

  private async setOrderLocal(snapshot: OrderModel) {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.setOrderLocal(snapshot, shop);
  }

  private async removeOrderLocal(snapshot: OrderModel) {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.removeOrderLocal(snapshot.id, shop);
  }

  async search(query: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.search(query, shop);
  }

  async deleteOrder(order: OrderModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.ordersWorker.deleteOrder(order, shop);
  }
}
