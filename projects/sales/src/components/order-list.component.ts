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
import { DeviceState, ShopModel, UserService } from "smartstock-core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { OrderState } from "../states/order.state";
import { OrderModel } from "../models/order.model";
import { DeleteConfirmDialogComponent } from "./delete-confirm-dialog.component";
import { CartState } from "../states/cart.state";
import { Router } from "@angular/router";
import moment from "moment";

import { OrdersItemsComponent } from "./dialog-orders-items.component";
import { InvoiceCartState } from "../states/invoice-cart.state";
import { InvoiceState } from "../states/invoice.state";
import { Dialog } from "@angular/cdk/dialog";

@Component({
  selector: "app-order-list",
  template: `
    <mat-progress-bar
      *ngIf="orderState.getOrderFlag | async"
      mode="indeterminate"
      color="primary"
    ></mat-progress-bar>
    <div class="my-table">
      <table
        *ngIf="(deviceState.isSmallScreen | async) === false"
        mat-table
        [dataSource]="dataSource"
        matSort
      >
        <ng-container matColumnDef="details">
          <th
            class="table-title-text"
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
          >
            Details
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            <p>
              <b>{{ row.firstName }} {{ row.secondName }}</b>
            </p>
            <p>Mobile : {{ row.mobile ? row.mobile : row.phone }}</p>
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
            Customer
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            {{ row?.customer?.displayName }}
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
            {{ row?.shipping?.mobile }}
          </td>
        </ng-container>
        <ng-container matColumnDef="Amount">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Amount
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            {{ row.total | fedha | async }}
          </td>
        </ng-container>
        <ng-container matColumnDef="Date">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Date
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            {{ dateT(row.date) }}
          </td>
        </ng-container>
        <ng-container matColumnDef="From">
          <th
            mat-header-cell
            class="table-title-text"
            *matHeaderCellDef
            mat-sort-header
          >
            Type
          </th>
          <td class="table-body-text" mat-cell *matCellDef="let row">
            {{ row.channel }}
          </td>
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
              <mat-nav-list>
                <mat-list-item (click)="processOrder(row)">
                  <p matLine>Process Order</p>
                  <mat-icon matListIcon>shopping_cart</mat-icon>
                </mat-list-item>
                <mat-list-item (click)="deleteOrder(row)">
                  <p matLine>Delete Order</p>
                  <mat-icon matListIcon>cancel</mat-icon>
                </mat-list-item>
                <mat-list-item (click)="orderDetails(row)">
                  <p matLine>Details</p>
                  <mat-icon matListIcon>info</mat-icon>
                </mat-list-item>
              </mat-nav-list>
            </mat-menu>
          </td>
        </ng-container>
        <tr
          class="customers-table-header"
          mat-header-row
          *matHeaderRowDef="
            (deviceState.isSmallScreen | async) === true
              ? displayColumnsMobile
              : displayColumns
          "
        ></tr>
        <tr
          mat-row
          class="table-data-row"
          *matRowDef="
            let row;
            columns: (deviceState.isSmallScreen | async) === true
              ? displayColumnsMobile
              : displayColumns
          "
        ></tr>
      </table>
    </div>

    <div id="l_c">
      <cdk-virtual-scroll-viewport
        style="min-height: 90vh"
        *ngIf="(deviceState.isSmallScreen | async) === true"
        [itemSize]="30"
      >
        <mat-list>
          <mat-list-item
            [matMenuTriggerFor]="menu"
            *cdkVirtualFor="let order of dataSource.connect() | async"
          >
            <h1 matLine>{{ order.total | fedha | async }}</h1>
            <p matLine>{{ order.shipping.mobile }}</p>
            <p matLine>{{ dateT(order.date) }}</p>
            <mat-icon matSuffix>more_horiz</mat-icon>
            <mat-menu xPosition="before" #menu>
              <mat-nav-list>
                <mat-list-item (click)="processOrder(order)">
                  <p matLine>Process Order</p>
                  <mat-icon matListIcon>shopping_cart</mat-icon>
                </mat-list-item>
                <mat-list-item (click)="deleteOrder(order)">
                  <p matLine>Delete Order</p>
                  <mat-icon matListIcon>cancel</mat-icon>
                </mat-list-item>
                <mat-list-item (click)="orderDetails(order)">
                  <p matLine>Details</p>
                  <mat-icon matListIcon>receipt</mat-icon>
                </mat-list-item>
              </mat-nav-list>
            </mat-menu>
          </mat-list-item>
        </mat-list>
      </cdk-virtual-scroll-viewport>
    </div>

    <app-data-not-ready *ngIf="noData"></app-data-not-ready>
  `,
  styleUrls: ["../styles/customers-table.style.css"]
})
export class OrderListComponent implements OnInit, OnDestroy, AfterViewInit {
  noData = false;
  customers: CustomerModel[];
  dataSource: MatTableDataSource<OrderModel> = new MatTableDataSource<
    OrderModel
  >([]);
  displayColumns = ["Name", "Mobile", "Amount", "Date", "From", "Action"];
  displayColumnsMobile = ["details"];
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  destroyer: Subject<any> = new Subject<any>();

  constructor(
    public readonly orderState: OrderState,
    private readonly dilaog: MatDialog,
    private readonly cartState: CartState,
    private readonly router: Router,
    private readonly invoiceCartState: InvoiceCartState,
    private readonly invoiceState: InvoiceState,
    public readonly deviceState: DeviceState,
    private readonly userServie: UserService,
  ) { }

  ngOnDestroy(): void {
    this.destroyer.next("done");
    this.dataSource = null;
    this.orderState.orders.next([]);
  }

  ngAfterViewInit(): void {
    this.configureDataSource();
  }

  async ngOnInit(): Promise<void> {
    this.orderState.getOrders();
  }

  configureDataSource() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.orderState.orders
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        this.dataSource.data = value;
      });
  }

  processOrder(row: OrderModel): void {
    switch (row?.channel) {
      case "retail":
        this.cartState.carts.next(row.items);
        this.cartState.cartOrder.next(row);
        this.cartState.selectedCustomer.next(row.customer);
        this.router.navigateByUrl("/sale/retail").catch(console.log);
        return;
      case "whole":
        this.cartState.carts.next(row.items);
        this.cartState.selectedCustomer.next(row.customer);
        this.cartState.cartOrder.next(row);
        this.router.navigateByUrl("/sale/whole").catch(console.log);
        return;
      case "profoma":
        this.invoiceCartState.carts.next(row.items.map(x => {
          return {
            amount: x.product.retailPrice,
            quantity: x.quantity,
            stock: x.product as any
          }
        }));
        this.invoiceState.processedOrder.next(row);
        this.invoiceCartState.totalItems();
        this.invoiceCartState.selectedCustomer.next(row.customer);
        this.router.navigateByUrl("/sale/invoices/create");
        return;
    }
  }

  deleteOrder(row: OrderModel): void {
    this.dilaog.open(DeleteConfirmDialogComponent, {
      data: {
        title: "Hello!",
        body: "Delete is permanent do you want to proceed"
      }
    })
      .afterClosed()
      .subscribe((value) => {
        if (value !== null) {
          this.orderState.deleteOrder(row);
        }
      });
  }

  dateT(date: any) {
    return moment(date).format("YYYY-MM-DD HH:mm");
  }

  async orderDetails(row) {
    let shop: ShopModel;
    try {
      shop = await this.userServie.getCurrentShop()
    } catch { }
    this.dilaog.open(OrdersItemsComponent, {
      closeOnNavigation: true,
      // position: {top: '24px', bottom: '', right: '', left: ''},
      data: {
        order: row,
        shop: shop
      }
    });
  }
}
