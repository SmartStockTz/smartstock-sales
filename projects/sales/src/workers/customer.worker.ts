import {expose} from 'comlink';
import {bfast} from 'bfastjs';
import {CustomerModel} from '../models/customer.model';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {sha256} from 'crypto-hash';

// import {v4} from 'uuid';

function init(shop: ShopModel) {
  bfast.init({
    applicationId: shop.applicationId,
    projectId: shop.projectId
  }, shop.projectId);
}

export class CustomerWorker {

  private remoteAllCustomerRunning = false;

  constructor(shop: ShopModel) {
    init(shop);
    // this.customersCache = ;
    const changes = bfast.database(shop.projectId)
      .table('customers')
      .query()
      .changes(() => {
        console.log('customer changes connected');
        if (this.remoteAllCustomerRunning === false) {
          this.getCustomersRemote(shop)
            .catch(console.log);
        } else {
          console.log('already fetched');
        }
      }, () => {
        console.log('customer changes disconnected');
      });
    changes.addListener(async response => {
      if (response && response.body && response.body.change) {
        // console.log(response.body.change);
        if (response.body.change.name === 'create') {
          this.setCustomerLocal(response.body.change.snapshot, shop).catch(console.log);
          // return;
        } else if (response.body.change.name === 'update') {
          this.setCustomerLocal(response.body.change.snapshot, shop).catch(console.log);
          // return;
        } else if (response.body.change.name === 'delete') {
          console.log(response.body.change.snapshot);
          await this.removeCustomerLocal(response.body.change.snapshot?.id, shop);
          // return;
        } else {
          // return;
        }
      }
    });
  }

  private static async customerLocalHashMap(localCustomers: any[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(localCustomers)) {
      for (const localC of localCustomers) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
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

  private async getCustomersLocal(shop: ShopModel): Promise<CustomerModel[]> {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).getAll();
    // const localCustomers: any[] = await this.customersCache.get('_all');
  }

  private async removeCustomerLocal(id: string, shop: ShopModel) {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).remove(id, true);
  }

  private async setCustomerLocal(customer: CustomerModel, shop: ShopModel) {
    return bfast.cache({database: 'customers', collection: 'customers'}, shop.projectId).set(customer.id, customer);
  }

  private async setCustomersLocal(customers: CustomerModel[], shop: ShopModel) {
    for (const customer of customers) {
      await this.setCustomerLocal(customer, shop);
    }
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
    const localCustomers = await this.getCustomersLocal(shop);
    const hashesMap = await CustomerWorker.customerLocalHashMap(localCustomers);
    let customers = [];
    try {
      customers = await this.remoteAllCustomers(shop, Object.keys(hashesMap));
      customers = this.remoteCustomerMapping(customers, hashesMap);
    } catch (e) {
      console.log(e);
      customers = localCustomers;
    }
    await this.setCustomersLocal(customers, shop);
    return customers;
  }

  async getCustomers(shop: ShopModel): Promise<CustomerModel[]> {
    const localCustomers: any[] = await this.getCustomersLocal(shop); // await this.customersCache.get('_all');
    if (Array.isArray(localCustomers) && localCustomers.length !== 0) {
      return localCustomers;
    } else {
      return this.getCustomersRemote(shop);
    }
  }

  async createCustomer(customer: CustomerModel, shop: ShopModel): Promise<CustomerModel> {
    return bfast.database(shop.projectId).table('customers').save(customer);
  }

  async search(query: string, shop: ShopModel): Promise<CustomerModel[]> {
    const localCustomers: any[] = await this.getCustomersLocal(shop); // this.customersCache.get('_all');
    if (Array.isArray(localCustomers)) {
      return localCustomers.filter(y => JSON.stringify(y).toLowerCase().includes(query.toLowerCase()));
    } else {
      return [];
    }
  }
}

expose(CustomerWorker);
