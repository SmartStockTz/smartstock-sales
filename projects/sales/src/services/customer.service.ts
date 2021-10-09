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
    // if (this.syncs) {
    //   try {
    //     this.syncs.close();
    //   } catch (e) {
    //     console.log(e);
    //   } finally {
    //     this.syncs = undefined;
    //   }
    // }
  }

  private async initClass(shop: ShopModel) {
    if (!this.customerWorker) {
      const CW = wrap(new Worker(new URL('../workers/customer.worker', import.meta.url))) as unknown as any;
      this.customerWorker = await new CW(shop);
    }
  }

  private customersFromSyncs(shop: ShopModel): CustomerModel[] {
    const customers: any = database(shop.projectId)
      .syncs('customers')
      .changes()
      .values();
    return Array.from(customers);
  }

  async getCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.listeningChanges();
    await this.initClass(shop);
    const c = this.customersFromSyncs(shop);
    // if (Array.isArray(c) && c.length === 0) {
    //   return this.getRemoteCustomers();
    // }
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
    return this.customerWorker.search(query, shop, this.customersFromSyncs(shop));
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
