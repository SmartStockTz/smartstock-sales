import {Injectable} from '@angular/core';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import {wrap} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {CustomerWorker} from '../workers/customer.worker';
import {cache, database} from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerWorker: CustomerWorker;

  constructor(private readonly userService: UserService) {

  }

  private async initClass(shop: ShopModel) {
    if (!this.customerWorker) {
      const CW = wrap(new Worker(new URL('../workers/customer.worker', import.meta.url))) as unknown as any;
      this.customerWorker = await new CW(shop);
    }
  }

  private async customersFromSyncs(shop: ShopModel): Promise<CustomerModel[]> {
    const cCache = cache({database: shop.projectId, collection: 'customers'});
    return cCache.getAll().then(customers => {
      if (Array.isArray(customers) && customers.length > 0) {
        return customers;
      }
      return this.getRemoteCustomers().then(rC => {
        cCache.setBulk(rC.map(x => x.id), rC).catch(console.log);
        return rC;
      });
    });
  }

  async getCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    // await this.listeningChanges();
    await this.initClass(shop);
    const c = await this.customersFromSyncs(shop);
    return this.customerWorker.sort(c);
  }

  async getRemoteCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    const c: any[] = await database(shop.projectId).table('customers').getAll();
    return this.customerWorker.getCustomersRemote(shop, c);
  }

  async createCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const shop = await this.userService.getCurrentShop();
    customer.id = SecurityUtil.generateUUID();
    customer.createdAt = new Date().toISOString();
    customer.updatedAt = new Date().toISOString();
    await database(shop.projectId).table('customers')
      .query()
      .byId(customer.id)
      .updateBuilder()
      .doc(customer)
      .update();
    cache({database: shop.projectId, collection: 'customers'}).set(customer.id, customer).catch(console.log);
    return customer;
  }

  async search(query: string): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.customerWorker.search(query, shop, await this.customersFromSyncs(shop));
  }

  async deleteCustomer(customer: CustomerModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId).table('customers').query().byId(customer.id).delete();
    cache({database: shop.projectId, collection: 'customers'}).remove(customer.id).catch(console.log);
    return customer;
  }
}
