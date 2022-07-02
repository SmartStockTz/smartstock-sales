import { Injectable } from "@angular/core";
import { SecurityUtil } from "smartstock-core";
import { CustomerModel } from "../models/customer.model";
import { BehaviorSubject } from "rxjs";
import { CustomerService } from "../services/customer.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root"
})
export class CustomerState {
  customers = new BehaviorSubject<CustomerModel[]>([]);
  loadingCustomers = new BehaviorSubject<boolean>(false);
  saveCustomerFlag = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly snack: MatSnackBar,
    private readonly customerService: CustomerService
  ) { }

  fetchCustomers(): void {
    this.loadingCustomers.next(true);
    this.customerService
      .getCustomers()
      .then((value) => {
        if (value && Array.isArray(value)) {
          this.customers.next(value);
        }
      })
      .catch((reason) => {
        this.errorMessage(reason);
      })
      .finally(() => {
        this.loadingCustomers.next(false);
      });
  }

  hotFetchCustomers(): void {
    this.loadingCustomers.next(true);
    this.customerService
      .getRemoteCustomers()
      .then((value) => {
        if (value && Array.isArray(value)) {
          this.customers.next(value);
        }
      })
      .catch((reason) => {
        this.errorMessage(reason);
      })
      .finally(() => {
        this.loadingCustomers.next(false);
      });
  }

  deleteCustomer(customer: CustomerModel): void {
    this.loadingCustomers.next(true);
    this.errorMessage("Deleting...");
    this.customerService
      .deleteCustomer(customer)
      .then((v) => {
        this.customers.next(
          this.customers.value.filter((x) => x.id !== customer.id)
        );
        this.errorMessage(`Customer ${customer.displayName} deleted permanent`);
      })
      .catch((reason) => {
        this.errorMessage(reason);
      })
      .finally(() => {
        this.loadingCustomers.next(false);
      });
  }

  async saveCustomer(customer: CustomerModel): Promise<any> {
    this.saveCustomerFlag.next(true);
    if (!customer.id) {
      customer.id = SecurityUtil.generateUUID();
    }
    if (!customer.createdAt) {
      customer.createdAt = new Date();
    }
    return this.customerService.createCustomer(customer).then((value) => {
      if (value) {
        let update = false;
        const c = this.customers.value.map((x) => {
          if (x.id === customer.id) {
            update = true;
            return value;
          } else {
            return x;
          }
        });
        if (update === false) {
          c.push(value);
        }
        this.customers.next(c);
      }
      return value;
    }).catch((reason) => {
      this.errorMessage(reason);
    }).finally(() => {
      this.saveCustomerFlag.next(false);
    });
  }

  private errorMessage(reason) {
    this.snack.open(reason.message ? reason.message : reason.toString(), "Ok", {
      duration: 2000
    });
  }

  search(query: string) {
    this.loadingCustomers.next(true);
    this.customerService
      .search(query)
      .then((value) => {
        if (value && Array.isArray(value)) {
          this.customers.next(value);
        }
      })
      .catch((reason) => {
        this.errorMessage(reason);
      })
      .finally(() => {
        this.loadingCustomers.next(false);
      });
  }
}
