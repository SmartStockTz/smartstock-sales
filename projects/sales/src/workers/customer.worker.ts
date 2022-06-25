import { expose } from "comlink";
import { CustomerModel } from "../models/customer.model";
import { ShopModel } from "smartstock-core";

export class CustomerWorker {
  constructor() {}

  private static async sortCustomers(
    customers: CustomerModel[]
  ): Promise<CustomerModel[]> {
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

  async getCustomersRemote(
    shop: ShopModel,
    customers: CustomerModel[]
  ): Promise<CustomerModel[]> {
    customers = await CustomerWorker.sortCustomers(customers);
    return customers;
  }

  async sort(customers: CustomerModel[]): Promise<CustomerModel[]> {
    return CustomerWorker.sortCustomers(customers);
  }

  async search(
    query: string,
    shop: ShopModel,
    customers: CustomerModel[]
  ): Promise<CustomerModel[]> {
    const localCustomers: any[] = await CustomerWorker.sortCustomers(customers);
    if (Array.isArray(localCustomers)) {
      return localCustomers.filter((y) =>
        JSON.stringify(y).toLowerCase().includes(query.toLowerCase())
      );
    } else {
      return [];
    }
  }
}

expose(CustomerWorker);
