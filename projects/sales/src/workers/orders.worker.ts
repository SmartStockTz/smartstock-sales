import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {CartItemModel} from '../models/cart-item.model';
import {OrderModel} from '../models/order.model';

export class OrdersWorker {

  constructor() {
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

  async sortOrders(rOrders: OrderModel[]) {
    rOrders.sort((a, b) => {
      if (a.createdAt > b.createdAt) {
        return -1;
      } else if (a.createdAt < b.createdAt) {
        return 1;
      } else {
        return 0;
      }
    });
    return rOrders;
  }

  async search(query: string, orders: OrderModel[], shop: ShopModel): Promise<any> {
    // const localOrders: any[] = await this.getOrdersLocal(shop);
    if (Array.isArray(orders)) {
      return orders.filter(y => JSON.stringify(y).toLowerCase().includes(query.toLowerCase()));
    } else {
      return [];
    }
  }

}

expose(OrdersWorker);
