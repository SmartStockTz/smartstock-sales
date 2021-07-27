import {expose} from 'comlink';
import {bfast} from 'bfastjs';
import {CustomerModel} from '../models/customer.model';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';

function init(shop: ShopModel) {
  bfast.init({
    applicationId: shop.applicationId,
    projectId: shop.projectId
  }, shop.projectId);
  const changes = bfast.database(shop.projectId).table('customers')
    .query()
    .changes(() => {
      console.log('customer changes connected');
    }, () => {
      console.log('customer changes disconnected');
    });
  changes.addListener(response => {
    console.log(response?.body?.change);
  });
}

export class CustomerWorker {

  constructor(shop: ShopModel) {
    init(shop);
  }

  async getCustomers(shop: ShopModel): Promise<CustomerModel[]> {
    return bfast.database(shop.projectId).collection('customers').getAll<CustomerModel>();
  }

  async createCustomer(customer: CustomerModel, shop: ShopModel): Promise<CustomerModel> {
    return bfast.database(shop.projectId).table('customers').save(customer);
  }

  async search(query: string, shop: ShopModel): Promise<CustomerModel[]> {
    const t = await bfast.database(shop.projectId).collection('customers')
      .query()
      .searchByRegex('displayName', `${query}`)
      .count(true)
      .find<number>();
    return bfast.database(shop.projectId).collection('customers')
      .query()
      .searchByRegex('displayName', `${query}`)
      .size(t)
      .skip(0)
      .find();
  }
}

expose(CustomerWorker);
