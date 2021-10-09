import {expose} from 'comlink';
import {CustomerModel} from '../models/customer.model';
import {ShopModel, getDaasAddress, getFaasAddress} from '@smartstocktz/core-libs';
import {init} from 'bfast';

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

export class CustomerWorker {

  constructor(shop: ShopModel) {
    init_(shop);
    // const changes =
    // .changes();
    // changes.observe(async response => {
    //   if (response && response.snapshot) {
    //     // console.log(response.body.change);
    //     if (response.name === 'create') {
    //       CustomerWorker.setCustomerLocal(response.body.change.snapshot, shop).catch(console.log);
    //       // return;
    //     } else if (response.body.change.name === 'update') {
    //       CustomerWorker.setCustomerLocal(response.body.change.snapshot, shop).catch(console.log);
    //       // return;
    //     } else if (response.body.change.name === 'delete') {
    //       // console.log(response.body.change.snapshot);
    //       await CustomerWorker.removeCustomerLocal(response.body.change.snapshot?.id, shop);
    //       // return;
    //     } else {
    //       // return;
    //     }
    //   }
    // });
  }

  private static async sortCustomers(customers: CustomerModel[]): Promise<CustomerModel[]> {
    customers.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      }
      if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    return customers;
  }

  // private static async removeCustomerLocal(id: string, shop: ShopModel) {
  //   bfast.database(shop.projectId).syncs('customers')
  //     .changes()
  //     .delete(id);
  // }

  // private static async setCustomerLocal(customer: CustomerModel, shop: ShopModel) {
  //   bfast.database(shop.projectId).syncs('customers')
  //     .changes()
  //     .set(customer);
  // }

  // private static async setCustomersLocal(customers: CustomerModel[], shop: ShopModel) {
  //   for (const customer of customers) {
  //     await this.setCustomerLocal(customer, shop);
  //   }
  // }

  async getCustomersRemote(shop: ShopModel, customers: CustomerModel[]): Promise<CustomerModel[]> {
    // let rCustomers: CustomerModel[] = await bfast.database(shop.projectId).syncs('customers').upload();
    customers = await CustomerWorker.sortCustomers(customers);
    // if (!customers) {
    //   customers = localCustomers;
    // }
    // customers.sort((a, b) => {
    //   if (a.createdAt < b.createdAt) {
    //     return 1;
    //   }
    //   if (a.createdAt > b.createdAt) {
    //     return -1;
    //   }
    //   return 0;
    // });
    // await CustomerWorker.setCustomersLocal(rCustomers, shop);
    return customers;
  }

  async sort(customers: CustomerModel[]): Promise<CustomerModel[]> {
    return CustomerWorker.sortCustomers(customers);
  }

  // async createCustomer(customer: CustomerModel, shop: ShopModel): Promise<CustomerModel> {
  //   if (!customer.id) {
  //     throw {message: 'id field is required'};
  //   }
  //   await CustomerWorker.setCustomerLocal(customer, shop);
  //   return customer;
  // }

  async search(query: string, shop: ShopModel, customers: CustomerModel[]): Promise<CustomerModel[]> {
    const localCustomers: any[] = await CustomerWorker.sortCustomers(customers);
    if (Array.isArray(localCustomers)) {
      return localCustomers.filter(y => JSON.stringify(y).toLowerCase().includes(query.toLowerCase()));
    } else {
      return [];
    }
  }

  // async deleteCustomer(customer: CustomerModel, shop: ShopModel): Promise<any> {
  //   await CustomerWorker.removeCustomerLocal(customer.id, shop);
  //   return customer;
  // }
}

expose(CustomerWorker);
