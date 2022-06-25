import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { CustomerModel } from "../models/customer.model";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { CustomerState } from "../states/customer.state";
import { DeviceState } from "smartstock-core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { DeleteConfirmDialogComponent } from "./delete-confirm-dialog.component";
import { DialogCreateCustomerComponent } from "./dialog-create-customer.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { SheetCreateCustomerComponent } from "./sheet-create-customer.component";

@Component({
  selector: "app-customers-table",
  template: `
    <div class="customers-container">
      <table mat-table [dataSource]="dataSource" matSort>
        <!--      <ng-container matColumnDef="details">-->
        <!--        <th class="table-title-text" mat-header-cell *matHeaderCellDef mat-sort-header>Details</th>-->
        <!--        <td class="table-body-text" mat-cell *matCellDef="let row">-->
        <!--          <p><b>{{row.firstName}} {{row.secondName}} | {{row.createdAt |date:'short'}}</b></p>-->
        <!--          <p>Mobile : {{ row.mobile ? row.mobile : row.phone }}</p>-->
        <!--          <p>Email : {{ row.email }}</p>-->
        <!--        </td>-->
        <!--        <td mat-footer-cell *matFooterCellDef></td>-->
        <!--      </ng-container>-->
        <ng-container matColumnDef="check">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            <mat-checkbox></mat-checkbox>
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            <mat-checkbox></mat-checkbox>
          </td>
          <td mat-footer-cell *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="Name">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Name
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            <app-customer-active [customer]="row"></app-customer-active>
            {{ row.displayName }} |
            <mat-card-subtitle>{{ row.createdAt | date }}</mat-card-subtitle>
          </td>
          <td mat-footer-cell *matFooterCellDef></td>
        </ng-container>
        <ng-container matColumnDef="Mobile">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Mobile
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            {{ row.mobile ? row.mobile : row.phone }}
          </td>
          <!--<td mat-footer-cell *matFooterCellDef>Total</td>-->
        </ng-container>
        <ng-container matColumnDef="Email">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Email
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            {{ row.email }}
          </td>
          <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
        </ng-container>
        <ng-container matColumnDef="Action">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Actions
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            <button [matMenuTriggerFor]="menu" mat-icon-button>
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #menu>
              <button (click)="updateCustomer(row)" mat-menu-item>
                Edit
              </button>
              <button (click)="deleteCustomer(row)" mat-menu-item>
                Delete
              </button>
            </mat-menu>
          </td>
        </ng-container>
        <tr
          class="customers-table-header"
          mat-header-row
          *matHeaderRowDef="displayColumns"
        ></tr>
        <tr
          mat-row
          class="table-data-row"
          *matRowDef="let row; columns: displayColumns"
        ></tr>
      </table>
      <app-data-not-ready
        *ngIf="dataSource.data.length === 0"
      ></app-data-not-ready>
    </div>
  `,
  styleUrls: [
    "../styles/customers-table.style.css",
    "../styles/customers-page.style.css"
  ]
})
export class CustomersTableComponent
  implements OnInit, OnDestroy, AfterViewInit {
  customers: CustomerModel[];
  dataSource: MatTableDataSource<CustomerModel> = new MatTableDataSource([]);
  displayColumns = ["check", "Name", "Mobile", "Email", "Action"];
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
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

  ngOnInit(): void {}

  configureDataSource() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.customerState.customers
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        setTimeout(() => (this.dataSource.data = value), 0);
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
