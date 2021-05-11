import {Injectable} from '@angular/core';
import {StorageService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs';
import bfast from 'bfastjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerState {
  static COLLECTION_NAME = 'customers';

  private customersSource = new BehaviorSubject<CustomerModel[]>([]);
  readonly customers$ = this.customersSource.asObservable();

  private loadingCustomersSubject = new BehaviorSubject<boolean>(true);
  readonly loadingCustomers$ = this.loadingCustomersSubject.asObservable();

  constructor(private readonly storage: StorageService) {
    this.fetchCustomers().then(customers => {
      this.loadingCustomersSubject.next(true);
      this.setCustomers(customers); // assume all customers transactions are online
    }).finally(() => {
      this.loadingCustomersSubject.next(false);
    });
  }

  getCustomersFromStorage(): Promise<CustomerModel[]> {
    return this.storage.getCustomers();
  }

  getCustomersFromSource(): CustomerModel[] {
    return this.customersSource.getValue();
  }

  async fetchCustomers(): Promise<CustomerModel[]> {
    // fetch from server or local storage
    const shop = await this.storage.getActiveShop();
    return bfast.database(shop.projectId).collection(CustomerState.COLLECTION_NAME).getAll<CustomerModel>();
  }


  async saveCustomer(customer: CustomerModel): Promise<CustomerModel> {
    const shop = await this.storage.getActiveShop();
    bfast.database(shop.projectId).collection(CustomerState.COLLECTION_NAME).save(customer).then(val => {
      const customers = [...this.getCustomersFromSource(), customer];
      this.customersSource.next(customers);
      return customer;
    });
    return this.storage.saveCustomer(customer);
  }

  private setCustomers(customers: CustomerModel[]) {
    this.customersSource.next(customers);
  }
}
