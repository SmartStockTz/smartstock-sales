import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { CustomerModel } from "../models/customer.model";
import { CustomerState } from "../states/customer.state";
import { DeviceState, UserService } from "smartstock-core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { DeleteConfirmDialogComponent } from "./delete-confirm-dialog.component";
import { DialogCreateCustomerComponent } from "./dialog-create-customer.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { SheetCreateCustomerComponent } from "./sheet-create-customer.component";
import { database } from "bfast";

@Component({
  selector: "app-customers-list",
  template: `
    <div
      class="customers-container-mobile"
      *ngIf="(deviceState.isSmallScreen | async) === true"
    >
      <mat-progress-bar
        *ngIf="customerState.loadingCustomers | async"
        mode="indeterminate"
        color="primary"
      ></mat-progress-bar>
      <cdk-virtual-scroll-viewport style="min-height: 90vh" [itemSize]="10">
        <mat-list>
          <mat-list-item
            [matMenuTriggerFor]="menu"
            *cdkVirtualFor="let customer of dataSource.connect() | async"
          >
            <h1 matLine>
              <app-customer-active [customer]="customer"></app-customer-active>
              {{ customer.displayName }} |
              <mat-card-subtitle>{{
                customer.createdAt | date
              }}</mat-card-subtitle>
            </h1>
            <p matLine>{{ customer.phone }}</p>
            <p matLine>{{ customer.email }}</p>
            <mat-icon matSuffix>more_horiz</mat-icon>
            <mat-menu xPosition="before" #menu>
              <button (click)="updateCustomer(customer)" mat-menu-item>
                Edit
              </button>
              <button (click)="deleteCustomer(customer)" mat-menu-item>
                Delete
              </button>
            </mat-menu>
          </mat-list-item>
        </mat-list>
      </cdk-virtual-scroll-viewport>
    </div>
    <app-data-not-ready
      *ngIf="dataSource.data.length === 0"
    ></app-data-not-ready>
  `,
  styleUrls: [
    "../styles/customers-table.style.css",
    "../styles/customers-page.style.css"
  ]
})
export class CustomersListComponent
  implements OnInit, OnDestroy, AfterViewInit {
  dataSource: MatTableDataSource<CustomerModel> = new MatTableDataSource([]);
  destroyer: Subject<any> = new Subject<any>();

  constructor(
    public readonly customerState: CustomerState,
    public readonly matDialog: MatDialog,
    public readonly matBottomSheet: MatBottomSheet,
    public readonly deviceState: DeviceState
  ) {}

  ngOnDestroy(): void {
    this.destroyer.next("done");
    this.dataSource = null;
    this.customerState.customers.next([]);
  }

  ngAfterViewInit(): void {
    this.configureDataSource();
  }

  async ngOnInit(): Promise<void> {
    this.customerState.fetchCustomers();
  }

  configureDataSource() {
    this.customerState.customers
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        this.dataSource.data = value;
      });
  }

  updateCustomer(row: CustomerModel): void {
    if (this.deviceState.isSmallScreen.value === true) {
      this.matBottomSheet.open(SheetCreateCustomerComponent, {
        data: {
          updateMode: true,
          customer: row
        },
        closeOnNavigation: true
      });
      return;
    }
    this.matDialog.open(DialogCreateCustomerComponent, {
      data: {
        updateMode: true,
        customer: row
      },
      maxWidth: "500px"
    });
  }

  deleteCustomer(row: CustomerModel): void {
    this.matDialog
      .open(DeleteConfirmDialogComponent, {
        data: {
          title: "Hello!",
          body: "Delete is permanent do you want to proceed"
        }
      })
      .afterClosed()
      .subscribe((value) => {
        if (value !== null) {
          this.customerState.deleteCustomer(row);
        }
      });
  }
}
