import {Injectable} from '@angular/core';
import {IpfsService, UserService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import {wrap} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {CustomerWorker} from '../workers/customer.worker';
import {database} from 'bfast';
import {CidService} from './cid.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerWorker: CustomerWorker;

  constructor(private readonly userService: UserService,
              private readonly cidsService: CidService) {

  }

  private async initClass(shop: ShopModel) {
    if (!this.customerWorker) {
      const CW = wrap(new Worker(new URL('../workers/customer.worker', import.meta.url))) as unknown as any;
      this.customerWorker = await new CW(shop);
    }
  }

  async getCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.customerWorker.getCustomers(shop);
  }

  private async remoteAllCustomers(shop: ShopModel): Promise<CustomerModel[]> {
    // this.remoteAllCustomerRunning = true;
    const cids = await database(shop.projectId)
      .collection('customers')
      .getAll<string>({
        cids: true
      }).finally(() => {
        // this.remoteAllCustomerRunning = false;
      });
    return this.cidsService.toDatas(cids);
  }

  async getRemoteCustomers(): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    const customers = await this.remoteAllCustomers(shop);
    return this.customerWorker.getCustomersRemote(shop, customers);
  }

  async createCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.customerWorker.createCustomer(customer, shop);
  }

  async search(query: string): Promise<CustomerModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.customerWorker.search(query, shop);
  }

  async deleteCustomer(customer: CustomerModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.initClass(shop);
    return this.customerWorker.deleteCustomer(customer, shop);
  }
}
