import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {CustomerModel} from '../models/customer.model';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {DeviceState, UserService} from '@smartstocktz/core-libs';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {OrderState} from '../states/order.state';
import {OrderModel} from '../models/order.model';
import {DeleteConfirmDialogComponent} from './delete-confirm-dialog.component';
import {CartState} from '../states/cart.state';
import {Router} from '@angular/router';
import moment from 'moment';

import {OrdersItemsComponent} from './orders-items.component';
import {database} from 'bfast';

@Component({
  selector: 'app-order-list',
  template: `
    <mat-progress-bar *ngIf="orderState.getOrderFlag | async" mode="indeterminate" color="primary"></mat-progress-bar>
    <table *ngIf="(deviceState.isSmallScreen | async) ===false" mat-table [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="details">
        <th class="table-title-text" mat-header-cell *matHeaderCellDef mat-sort-header>Details</th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <p><b>{{row.firstName}} {{row.secondName}}</b></p>
          <p>Mobile : {{ row.mobile ? row.mobile : row.phone }}</p>
          <p>Email : {{ row.email }}</p>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <ng-container matColumnDef="check">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>
          <mat-checkbox></mat-checkbox>
        </th>
        <td class="table-body-text" mat-cell *matCellDef="let row">
          <mat-checkbox></mat-checkbox>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="Name">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Customer</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row?.customer?.displayName}} </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>
      <ng-container matColumnDef="Mobile">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Mobile</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{ row?.shipping?.mobile}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>Total</td>-->
      </ng-container>
      <ng-container matColumnDef="Amount">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Amount</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.total | fedha | async}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
      </ng-container>
      <ng-container matColumnDef="Date">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Date</th>
        <td class="table-body-text" mat-cell *matCellDef="let row"> {{dateT(row.date)}} </td>
        <!--<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>-->
      </ng-container>
      <!--      <ng-container matColumnDef="Status">-->
      <!--        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Status</th>-->
      <!--        <td class="table-body-text" mat-cell *matCellDef="let row"> {{row.paid === true?'PAID':''}} </td>-->
      <!--        &lt;!&ndash;<td mat-footer-cell *matFooterCellDef>{{getTotal()}}</td>&ndash;&gt;-->
      <!--      </ng-container>-->
      <ng-container matColumnDef="Action">
        <th mat-header-cell class="table-title-text" *matHeaderCellDef mat-sort-header>Actions</th>
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
                <mat-icon matListIcon>receipt</mat-icon>
              </mat-list-item>
            </mat-nav-list>
          </mat-menu>
        </td>
      </ng-container>
      <tr class="customers-table-header" mat-header-row
          *matHeaderRowDef="(deviceState.isSmallScreen | async)===true?displayColumnsMobile:displayColumns"></tr>
      <tr mat-row class="table-data-row"
          *matRowDef="let row; columns: (deviceState.isSmallScreen | async)===true?displayColumnsMobile:displayColumns;"></tr>
    </table>

    <div id="l_c">
      <cdk-virtual-scroll-viewport style="min-height: 90vh" *ngIf="(deviceState.isSmallScreen | async) ===true" [itemSize]="30">
        <mat-list>
          <mat-list-item [matMenuTriggerFor]="menu" *cdkVirtualFor="let order of dataSource.connect() | async">
            <h1 matLine>{{order.total | fedha | async}}</h1>
            <p matLine>{{order.shipping.mobile}}</p>
            <p matLine>{{dateT(order.date)}}</p>
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
  styleUrls: ['../styles/customers-table.style.css']
})
export class OrderListComponent implements OnInit, OnDestroy, AfterViewInit {
  noData = false;
  customers: CustomerModel[];
  dataSource: MatTableDataSource<OrderModel> = new MatTableDataSource<OrderModel>([]);
  displayColumns = ['check', 'Name', 'Mobile', 'Amount', 'Date', 'Action'];
  displayColumnsMobile = ['details'];
  @Input() paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  destroyer: Subject<any> = new Subject<any>();
  private sig = false;
  private obfn;

  constructor(public readonly orderState: OrderState,
              public readonly matDialog: MatDialog,
              public readonly matBottomSheet: MatBottomSheet,
              public readonly cartState: CartState,
              public readonly router: Router,
              private readonly userService: UserService,
              public readonly deviceState: DeviceState) {
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
    this.dataSource = null;
    this.orderState.orders.next([]);
    this?.obfn?.unobserve();
  }

  ngAfterViewInit(): void {
    this.configureDataSource();
  }

  async ngOnInit(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    this.orderState.getOrders();
    this.obfn = database(shop.projectId).syncs('orders').changes().observe(_ => {
      if (this.sig === true){
        return;
      }
      this.orderState.getOrders();
      this.sig = true;
    });
  }

  configureDataSource() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.orderState.orders.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      this.dataSource.data = value;
    });
  }

  processOrder(row: OrderModel): void {
    switch (row?.channel) {
      case 'retail':
        this.cartState.carts.next(row.items);
        this.cartState.cartOrder.next(row);
        this.cartState.selectedCustomer.next(row.customer);
        this.router.navigateByUrl('/sale/retail').catch(console.log);
        return;
      case 'whole':
        this.cartState.carts.next(row.items);
        this.cartState.selectedCustomer.next(row.customer);
        this.cartState.cartOrder.next(row);
        this.router.navigateByUrl('/sale/whole').catch(console.log);
        return;
    }
  }

  deleteOrder(row: OrderModel): void {
    this.matDialog.open(DeleteConfirmDialogComponent, {
      data: {
        title: 'Hello!',
        body: 'Delete is permanent do you want to proceed'
      }
    }).afterClosed().subscribe(value => {
      if (value !== null) {
        this.orderState.deleteOrder(row);
      }
    });
  }

  dateT(date: any) {
    // console.log(date);
    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  orderDetails(row) {
    this.matBottomSheet.open(OrdersItemsComponent, {
      closeOnNavigation: true,
      data: {
        order: row
      }
    });
  }
}
