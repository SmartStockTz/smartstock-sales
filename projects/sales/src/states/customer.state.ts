import {Injectable} from '@angular/core';
import {SecurityUtil, StorageService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerState {

  constructor(private readonly storage: StorageService) {
  }

  getCustomers(): Promise<CustomerModel[]> {
    return this.storage.getCustomers().then((value: any) => {
      return value.map(x => {
        x.firstName = x.firstName.toString().split('@')[0];
        return x;
      });
    });
  }

  async saveCustomer(customer: CustomerModel): Promise<CustomerModel> {
    customer.firstName = customer.firstName.concat('@').concat(SecurityUtil.generateUUID());
    return this.storage.saveCustomer(customer);
  }
}
