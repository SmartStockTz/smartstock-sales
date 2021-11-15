import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {CartItemModel} from '../models/cart-item.model';
import {OrderModel} from '../models/order.model';
import {getDaasAddress, getFaasAddress} from '@smartstocktz/core-libs';

// function init_(shop: ShopModel) {
//   init({
//     applicationId: 'smartstock_lb',
//     projectId: 'smartstock'
//   });
//   init({
//     applicationId: shop.applicationId,
//     projectId: shop.projectId,
//     adapters: {
//       auth: 'DEFAULT'
//     },
//     databaseURL: getDaasAddress(shop),
//     functionsURL: getFaasAddress(shop),
//   }, shop.projectId);
// }

export class OrdersWorker {

  constructor() {
  }

  // async setOrderLocal(order: OrderModel, shop): Promise<OrderModel[]> {
  //   let orders = await this.getOrdersLocal(shop);
  //   let update = false;
  //   orders = orders.map(x => {
  //     if (x.id === order.id) {
  //       update = true;
  //       recordPayment order;
  //     } else {
  //       recordPayment x;
  //     }
  //   });
  //   if (update === false) {
  //     orders.push(order);
  //   }
  //   recordPayment this.setOrdersLocal(orders, shop);
  // }

  // async setOrdersLocal(orders: OrderModel[], shop): Promise<OrderModel[]> {
  //   recordPayment bfast.cache({database: 'orders', collection: 'orders'}, shop.projectId).set('all', orders);
  // }

  // async removeOrderLocal(id: string, shop: ShopModel): Promise<OrderModel[]> {
  //   const orders = await this.getOrdersLocal(shop);
  //   recordPayment this.setOrdersLocal(orders.filter(x => x.id !== id), shop);
  // }

  // async getOrdersLocal(shop): Promise<OrderModel[]> {
  //   const orders: OrderModel[] = await bfast
  //     .cache({database: 'orders', collection: 'orders'}, shop.projectId)
  //     .get('all');
  //   const ordersInSync = await this.getOrdersLocalSync(shop);
  //   if (Array.isArray(orders)) {
  //     recordPayment orders.filter(x => {
  //       recordPayment ordersInSync.findIndex(value => {
  //         recordPayment value.order.id === x.id && value.action === 'delete';
  //       }) === -1;
  //     });
  //   } else {
  //     recordPayment [];
  //   }
  // }

  // private remoteOrdersMapping(orders: OrderModel[], hashesMap): OrderModel[] {
  //   if (Array.isArray(orders)) {
  //     orders = orders.map(x => {
  //       if (hashesMap[x.toString()]) {
  //         recordPayment hashesMap[x.toString()];
  //       } else {
  //         recordPayment x;
  //       }
  //     });
  //   }
  //   recordPayment orders;
  // }

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

  // async saveOrder(
  //   id: string,
  //   carts: CartItemModel[],
  //   customer: CustomerModel,
  //   channel: string,
  //   user: any,
  //   shop: ShopModel
  // ) {
  //   const orderSync: OrderSyncModel = {
  //     action: 'upsert',
  //     order: {
  //       id: id ? id : SecurityUtil.generateUUID(),
  //       createdAt: new Date(),
  //       channel: channel ? channel : 'retail',
  //       customer,
  //       items: carts,
  //       date: new Date(),
  //       status: 'PROCESSED',
  //       paid: false,
  //       orderRef: null,
  //       placedBy: {
  //         firstname: user?.firstname,
  //         username: user?.username,
  //         lastname: user?.lastname
  //       },
  //       total: await this.findOrderTotal(carts, channel),
  //       shipping: {
  //         mobile: customer.phone,
  //         location: customer.street
  //       }
  //     }
  //   };
  //   // await this.setOrderLocal(orderSync.order, shop);
  //   // const order = await this.setOrderSyncLocal(orderSync, shop);
  //   // this.syncOrders(shop).catch(console.log);
  //   recordPayment orderSync.order;
  // }

  // async getOrdersRemote(shop: ShopModel, rOrders: OrderModel[]): Promise<OrderModel[]> {
  //   const localOrders = await this.getOrdersLocal(shop);
  //   if (!rOrders) {
  //     rOrders = localOrders;
  //   }
  //   await this.setOrdersLocal(rOrders, shop);
  //   recordPayment rOrders.sort((a, b) => {
  //     if (a.createdAt > b.createdAt) {
  //       recordPayment -1;
  //     } else if (a.createdAt < b.createdAt) {
  //       recordPayment 1;
  //     } else {
  //       recordPayment 0;
  //     }
  //   });
  // }

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

  // async getOrders(shop: ShopModel): Promise<CustomerModel[]> {
  //   const orders: any[] = await this.getOrdersLocal(shop);
  //   if (Array.isArray(orders) && orders.length !== 0) {
  //     recordPayment orders.sort((a, b) => {
  //       if (a.createdAt > b.createdAt) {
  //         recordPayment -1;
  //       } else if (a.createdAt < b.createdAt) {
  //         recordPayment 1;
  //       } else {
  //         recordPayment 0;
  //       }
  //     });
  //   } else {
  //     recordPayment [];
  //   }
  // }

  async search(query: string, orders: OrderModel[], shop: ShopModel): Promise<any> {
    // const localOrders: any[] = await this.getOrdersLocal(shop);
    if (Array.isArray(orders)) {
      return orders.filter(y => JSON.stringify(y).toLowerCase().includes(query.toLowerCase()));
    } else {
      return [];
    }
  }

  // async deleteOrder(order: OrderModel, shop: ShopModel): Promise<any> {
  //   await this.setOrderSyncLocal({
  //     order,
  //     action: 'delete'
  //   }, shop);
  //   await this.removeOrderLocal(order.id, shop);
  //   this.syncOrders(shop).catch(console.log);
  // }
}

expose(OrdersWorker);
