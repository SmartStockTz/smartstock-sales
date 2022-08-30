import {Injectable} from '@angular/core';
import {UserService} from 'smartstock-core';
import {CustomerModel} from '../models/customer.model';
import {wrap} from 'comlink';
import {CustomerWorker} from '../workers/customer.worker';
import {cache, functions} from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private readonly userService: UserService) {
  }

  private static async withWorker(
    fn: (customerWorker: CustomerWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL('../workers/customer.worker', import .meta.url)
      );
      const SW = (wrap(nativeWorker) as unknown) as any;
      const stWorker = await new SW();
      return await fn(stWorker);
    } finally {
      if (nativeWorker) {
        nativeWorker.terminate();
      }
    }
  }

  private async customersFromSyncs(shop: any): Promise<CustomerModel[]> {
    const cCache = cache({database: shop.projectId, collection: 'customers'});
    return cCache.getAll().then((customers) => {
      if (Array.isArray(customers) && customers.length > 0) {
        return customers;
      }
      return this.getRemoteCustomers().then((rC) => {
        cCache
          .setBulk(
            rC.map((x) => x.displayName),
            rC
          )
          .catch(console.log);
        return rC;
      });
    });
  }

  async getCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    const c = await this.customersFromSyncs(shop);
    return CustomerService.withWorker((customerWorker) =>
      customerWorker.sort(c)
    );
  }

  async getRemoteCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    const url = `https://smartstock-faas.bfast.fahamutech.com/shop/${shop.projectId}/${shop.applicationId}/sale/customers`;
    const c: any[] = await functions().request(url).get();
    return CustomerService.withWorker((customerWorker) =>
      customerWorker.getCustomersRemote(shop, c)
    );
  }

  async createCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const shop = await this.userService.getCurrentShop();
    const url = `https://smartstock-faas.bfast.fahamutech.com/shop/${shop.projectId}/${shop.applicationId}/sale/customers`;
    if (!customer.phone || customer.phone.trim() === '') {
      customer.phone = '255';
    }
    await functions().request(url).put(customer);
    cache({database: shop.projectId, collection: 'customers'})
      .set(customer.displayName, customer)
      .catch(console.log);
    return customer;
  }

  async search(query: string): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    return CustomerService.withWorker(async (customerWorker) =>
      customerWorker.search(query, shop, await this.customersFromSyncs(shop))
    );
  }

  async deleteCustomer(customer: CustomerModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const url = `https://smartstock-faas.bfast.fahamutech.com/shop/${shop.projectId}/${shop.applicationId}/sale/customers/${customer.id}`;
    await functions().request(url).delete();
    cache({database: shop.projectId, collection: 'customers'})
      .remove(customer.displayName)
      .catch(console.log);
    return customer;
  }
}
