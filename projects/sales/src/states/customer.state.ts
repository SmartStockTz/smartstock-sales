import {Injectable} from '@angular/core';
import {StorageService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import {BehaviorSubject} from 'rxjs';
import {CustomerService} from '../services/customer.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CustomerState {
  customers = new BehaviorSubject<CustomerModel[]>([]);
  loadingCustomers = new BehaviorSubject<boolean>(false);
  saveCustomerFlag = new BehaviorSubject<boolean>(false);

  constructor(private readonly storage: StorageService,
              private readonly snack: MatSnackBar,
              private readonly customerService: CustomerService) {
  }

  fetchCustomers(): void {
    this.loadingCustomers.next(true);
    this.customerService.getCustomers().then(value => {
      if (value && Array.isArray(value)) {
        this.customers.next(value);
      }
    }).catch(reason => {
      this.errorMessage(reason);
    }).finally(() => {
      this.loadingCustomers.next(false);
    });
  }

  async saveCustomer(customer: CustomerModel): Promise<any> {
    this.saveCustomerFlag.next(true);
    return this.customerService.createCustomer(customer).then(value => {
      if (value) {
        this.customers.value.push(value);
        this.customers.next(this.customers.value);
      }
      return value;
    }).catch(reason => {
      this.errorMessage(reason);
    }).finally(() => {
      this.saveCustomerFlag.next(false);
    });
  }

  private errorMessage(reason) {
    this.snack.open(reason.message ? reason.message : reason.toString(), 'Ok', {duration: 2000});
  }

  search(query: string) {
    this.loadingCustomers.next(true);
    this.customerService.search(query).then(value => {
      if (value && Array.isArray(value)) {
        this.customers.next(value);
      }
    }).catch(reason => {
      this.errorMessage(reason);
    }).finally(() => {
      this.loadingCustomers.next(false);
    });
  }
}
