import {expose} from 'comlink';
import {bfast} from 'bfastjs';
import {CustomerModel} from '../models/customer.model';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {sha256} from 'crypto-hash';

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
        if (this.remoteAllCustomerRunning === false) {
          this.getCustomersRemote(shop)
            .catch(console.log);
        } else {
          // console.log('already fetched');
        }
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
  private remoteAllCustomerRunning = false;

  private static async customerLocalHashMap(localCustomers: any[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(localCustomers)) {
      for (const localC of localCustomers) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
  }

  private static async getCustomersLocal(shop: ShopModel): Promise<CustomerModel[]> {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).getAll();
    // const localCustomers: any[] = await this.customersCache.get('_all');
  }

  private static async removeCustomerLocal(id: string, shop: ShopModel) {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).remove(id, true);
  }

  private static async setCustomerLocal(customer: CustomerModel, shop: ShopModel) {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).set(customer.id, customer);
  }

  private static async setCustomerLocalSync(customer: CustomerModel, shop: ShopModel) {
    return bfast.cache({database: 'customersSync', collection: 'customersSync'}, shop.projectId).set(customer.id, customer);
  }

  private static async getCustomersLocalSync(shop: ShopModel) {
    // console.log('******');
    return bfast.cache({database: 'customersSync', collection: 'customersSync'}, shop.projectId).getAll();
  }

  private static async removeCustomerLocalSync(customer: CustomerModel, shop: ShopModel) {
    // console.log(customer);
    return bfast.cache({database: 'customersSync', collection: 'customersSync'}, shop.projectId).remove(customer.id, true);
  }

  private static async setCustomersLocal(customers: CustomerModel[], shop: ShopModel) {
    for (const customer of customers) {
      await CustomerWorker.setCustomerLocal(customer, shop);
    }
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

  private async remoteAllCustomers(shop: ShopModel, hashes: any[] = []): Promise<CustomerModel[]> {
    this.remoteAllCustomerRunning = true;
    return bfast.database(shop.projectId)
      .collection('customers')
      .getAll<CustomerModel>({
        hashes
      }).finally(() => {
        this.remoteAllCustomerRunning = false;
      });
  }

  private remoteCustomerMapping(customers: CustomerModel[], hashesMap): CustomerModel[] {
    if (Array.isArray(customers)) {
      customers = customers.map(x => {
        if (hashesMap[x.toString()]) {
          return hashesMap[x.toString()];
        } else {
          return x;
        }
      });
    }
    return customers;
  }

  async getCustomersRemote(shop: ShopModel): Promise<CustomerModel[]> {
    const localCustomers = await CustomerWorker.getCustomersLocal(shop);
    const hashesMap = await CustomerWorker.customerLocalHashMap(localCustomers);
    let customers = [];
    try {
      customers = await this.remoteAllCustomers(shop, Object.keys(hashesMap));
      customers = this.remoteCustomerMapping(customers, hashesMap);
    } catch (e) {
      console.log(e);
      customers = localCustomers;
    }
    await CustomerWorker.setCustomersLocal(customers, shop);
    return customers;
  }

  async getCustomers(shop: ShopModel): Promise<CustomerModel[]> {
    const localCustomers: any[] = await CustomerWorker.getCustomersLocal(shop); // await this.customersCache.get('_all');
    if (Array.isArray(localCustomers) && localCustomers.length !== 0) {
      return localCustomers;
    } else {
      return this.getCustomersRemote(shop);
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
