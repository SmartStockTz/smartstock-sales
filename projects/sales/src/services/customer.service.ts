import {Injectable} from '@angular/core';
import {UserService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import {wrap} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {CustomerWorker} from '../workers/customer.worker';
import {database} from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerWorker: CustomerWorker;

  constructor(private readonly userService: UserService) {

  }

  async listeningChanges() {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('customers');
  }

  async stopChanges() {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('customers').close();
  }

  private async initClass(shop: ShopModel) {
    if (!this.customerWorker) {
      const CW = wrap(new Worker(new URL('../workers/customer.worker', import.meta.url))) as unknown as any;
      this.customerWorker = await new CW(shop);
    }
  }

  private async customersFromSyncs(shop: ShopModel): Promise<CustomerModel[]> {
    return new Promise((resolve, reject) => {
      try {
        database(shop.projectId).syncs('customers', syncs => {
          const c = Array.from(syncs.changes().values());
          if (c.length === 0) {
            this.getRemoteCustomers().then(resolve).catch(reject);
          } else {
            resolve(c);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.listeningChanges();
    await this.initClass(shop);
    const c = await this.customersFromSyncs(shop);
    return this.customerWorker.sort(c);
  }

  async getRemoteCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.listeningChanges();
    await this.initClass(shop);
    const c = await database(shop.projectId).syncs('customers').upload();
    return this.customerWorker.getCustomersRemote(shop, c);
  }

  async createCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const shop = await this.userService.getCurrentShop();
    // await this.initClass(shop);
    database(shop.projectId).syncs('customers')
      .changes()
      .set(customer as any);
    return customer;
    // return this.customerWorker.createCustomer(customer, shop);
  }

  async search(query: string): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.customerWorker.search(query, shop, await this.customersFromSyncs(shop));
  }

  async deleteCustomer(customer: CustomerModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    // await this.initClass(shop);
    database(shop.projectId).syncs('customers')
      .changes()
      .delete(customer.id);
    return customer;
    // return this.customerWorker.deleteCustomer(customer, shop);
  }
}
