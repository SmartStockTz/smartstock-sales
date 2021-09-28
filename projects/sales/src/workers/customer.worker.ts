import {expose} from 'comlink';
import * as bfast from 'bfast';
import {CustomerModel} from '../models/customer.model';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';

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

export class CustomerWorker {

  constructor(shop: ShopModel) {
    init(shop);
    const changes = bfast.database(shop.projectId)
      .table('customers')
      .query()
      .changes(() => {
        console.log('customer changes connected');
        this.syncCustomers(shop).catch(console.log);
      }, () => {
        console.log('customer changes disconnected');
      });
    changes.addListener(async response => {
      if (response && response.body && response.body.change) {
        // console.log(response.body.change);
        if (response.body.change.name === 'create') {
          CustomerWorker.setCustomerLocal(response.body.change.snapshot, shop).catch(console.log);
          // return;
        } else if (response.body.change.name === 'update') {
          CustomerWorker.setCustomerLocal(response.body.change.snapshot, shop).catch(console.log);
          // return;
        } else if (response.body.change.name === 'delete') {
          // console.log(response.body.change.snapshot);
          await CustomerWorker.removeCustomerLocal(response.body.change.snapshot?.id, shop);
          // return;
        } else {
          // return;
        }
      }
    });
  }

  private syncInterval;

  private static async getCustomersLocal(shop: ShopModel): Promise<CustomerModel[]> {
    const customers: CustomerModel[] = await bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).get('all');
    // const localCustomers: any[] = await this.customersCache.get('_all');
    if (Array.isArray(customers)) {
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
    } else {
      return [];
    }
  }

  private static async removeCustomerLocal(id: string, shop: ShopModel) {
    // return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).remove(id, true);
    const customers = await this.getCustomersLocal(shop);
    return this.setCustomersLocal(customers.filter(x => x.id !== id), shop);
  }

  private static async setCustomerLocal(customer: CustomerModel, shop: ShopModel) {
    let customers = await this.getCustomersLocal(shop);
    let update = false;
    customers = customers.map(x => {
      if (x.id === customer.id) {
        update = true;
        return customer;
      } else {
        return x;
      }
    });
    if (update === false) {
      customers.push(customer);
    }
    return this.setCustomersLocal(customers, shop);
  }

  private static async setCustomerLocalSync(customer: CustomerModel, shop: ShopModel) {
    return bfast.cache({database: 'customers', collection: 'customers_sync'}, shop.projectId).set(customer.id, customer);
  }

  private static async getCustomersLocalSync(shop: ShopModel) {
    // console.log('******');
    return bfast.cache({database: 'customers', collection: 'customers_sync'}, shop.projectId)
      .getAll();
  }

  private static async removeCustomerLocalSync(customer: CustomerModel, shop: ShopModel) {
    // console.log(customer);
    return bfast.cache({database: 'customers', collection: 'customers_sync'}, shop.projectId).remove(customer.id, true);
  }

  private static async setCustomersLocal(customers: CustomerModel[], shop: ShopModel) {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).set('all', customers);
    // for (const customer of customers) {
    //   await CustomerWorker.setCustomerLocal(customer, shop);
    // }
  }

  private async syncCustomers(shop: ShopModel) {
    let isRunn = false;
    if (this.syncInterval) {
      return;
    }
    // console.log('customer sync start');
    this.syncInterval = setInterval(async () => {
      if (isRunn === true) {
        return;
      }
      isRunn = true;
      const customers = await CustomerWorker.getCustomersLocalSync(shop);
      // console.log(customers);
      if (Array.isArray(customers) && customers.length === 0) {
        isRunn = false;
        clearInterval(this.syncInterval);
        this.syncInterval = undefined;
        // console.log('customer sync stop');
      } else {
        for (const customer of customers) {
          try {
            await bfast.database(shop.projectId)
              .table('customers')
              .query()
              .byId(customer.id)
              .updateBuilder()
              .doc(customer)
              .upsert(true)
              .update();
            await CustomerWorker.removeCustomerLocalSync(customer, shop);
            isRunn = false;
          } catch (e) {
            console.log(e);
          }
        }
      }
      // isRunn = false;
    }, 2000);
  }

  async getCustomersRemote(shop: ShopModel, rCustomers: CustomerModel[]): Promise<CustomerModel[]> {
    const localCustomers = await CustomerWorker.getCustomersLocal(shop);
    if (!rCustomers) {
      rCustomers = localCustomers;
    }
    await CustomerWorker.setCustomersLocal(rCustomers, shop);
    return rCustomers;
  }

  async getCustomers(shop: ShopModel): Promise<CustomerModel[]> {
    const localCustomers: any[] = await CustomerWorker.getCustomersLocal(shop); // await this.customersCache.get('_all');
    if (Array.isArray(localCustomers) && localCustomers.length !== 0) {
      return localCustomers;
    } else {
      return [];
    }
  }

  async createCustomer(customer: CustomerModel, shop: ShopModel): Promise<CustomerModel> {
    if (!customer.id) {
      throw {message: 'id field is required'};
    }
    await CustomerWorker.setCustomerLocalSync(customer, shop);
    await CustomerWorker.setCustomerLocal(customer, shop);
    this.syncCustomers(shop).catch(console.log);
    return customer;
  }

  async search(query: string, shop: ShopModel): Promise<CustomerModel[]> {
    const localCustomers: any[] = await CustomerWorker.getCustomersLocal(shop);
    if (Array.isArray(localCustomers)) {
      return localCustomers.filter(y => JSON.stringify(y).toLowerCase().includes(query.toLowerCase()));
    } else {
      return [];
    }
  }

  async deleteCustomer(customer: CustomerModel, shop: ShopModel): Promise<any> {
    const c = await bfast.database(shop.projectId)
      .table('customers')
      .query()
      .byId(customer.id)
      .delete();
    await CustomerWorker.removeCustomerLocal(customer.id, shop);
    return c;
  }
}

expose(CustomerWorker);
