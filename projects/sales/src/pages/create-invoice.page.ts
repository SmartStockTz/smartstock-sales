import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {CartState} from '../states/cart.state';
import {StockState} from '../states/stock.state';
import {CustomerState} from '../states/customer.state';
import {InvoiceCartState} from '../states/invoice-cart.state';

@Component({
  selector: 'app-invoice-create',
  template: `
    <app-layout-sidenav
      [showSearch]="true"
      searchPlaceholder="Search product..."
      (searchCallback)="filterProduct($event)"
      [hiddenMenu]="hOptions"
      [visibleMenu]="vOptions"
      backLink="/sale/invoices"
      [hasBackRoute]="true"
      heading="Create invoice"
      [leftDrawer]="side"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [rightDrawer]="right"
      [cartBadge]="cartState.cartTotalItems | async"
      [rightDrawerMode]="(deviceState.enoughWidth |async)===true?'side':'over'"
      [rightDrawerOpened]="(cartState.carts | async)?.length>0 && (deviceState.isSmallScreen |async)===false"
      [body]="body">
      <ng-template #right>
        <app-invoice-cart></app-invoice-cart>
      </ng-template>
      <ng-template #vOptions>

      </ng-template>
      <ng-template #hOptions>
        <button (click)="stockState.getStocksFromRemote()" mat-menu-item>
          <mat-icon>refresh</mat-icon>
          Reload
        </button>
      </ng-template>
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-invoice-product-tiles *ngIf="(deviceState.isSmallScreen | async) === false"></app-invoice-product-tiles>
        <app-invoice-product-list *ngIf="(deviceState.isSmallScreen | async) === true"></app-invoice-product-list>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/create.style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateInvoicePage implements OnInit, OnDestroy {

  constructor(
    public readonly stockState: StockState,
    public readonly cartState: InvoiceCartState,
    private readonly customerState: CustomerState,
    public readonly deviceState: DeviceState,
  ) {
    document.title = 'SmartStock - Invoice Create';
  }

  async ngOnInit(): Promise<void> {
    this.customerState.fetchCustomers();
  }

  ngOnDestroy() {
  }

  filterProduct($event: string) {
    this.stockState.stocks.filter = $event;
  }
}
