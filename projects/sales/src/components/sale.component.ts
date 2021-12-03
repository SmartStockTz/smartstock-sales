import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {SalesState} from '../states/sales.state';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl, Validators} from '@angular/forms';
import {DeviceState} from '@smartstocktz/core-libs';
import {CartState} from '../states/cart.state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-sale',
  template: `
    <mat-sidenav-container class="match-parent">
      <mat-sidenav class="match-parent-side" #sidenav
                   [mode]="(deviceState.enoughWidth | async)===true?'side':'over'"
                   [opened]="(deviceState.enoughWidth | async)===true">
        <app-drawer></app-drawer>
      </mat-sidenav>
      <mat-sidenav #cartdrawer [fixedInViewport]="false" position="end"
                   [mode]="(deviceState.enoughWidth | async)===true?'side':'over'"
                   [opened]="false">
        <app-cart [channel]="isViewedInWholesale?'whole':'retail'" [cartdrawer]="cartdrawer"></app-cart>
      </mat-sidenav>
      <mat-sidenav-content style="display:flex; flex-direction: column">
        <app-toolbar (searchCallback)="filterProduct($event)"
                     [showSearch]="true"
                     [hasBackRoute]="true" [backLink]="'/sale/'"
                     searchPlaceholder="Filter product"
                     [searchInputControl]="searchInputControl"
                     [searchProgressFlag]="salesState.searchProgress | async"
                     [heading]="isViewedInInvoice ? 'Invoice' :isViewedInWholesale?'WholeSale':'Retail'"
                     [sidenav]="sidenav"
                     [cartDrawer]="cartdrawer"
                     [showProgress]="salesState.searchProgress | async">
        </app-toolbar>
        <app-on-fetch [isLoading]="(salesState.fetchProductsProgress | async)==true"
                      *ngIf="(salesState.fetchProductsProgress | async)==true"
                      (refreshCallback)="getProductsRemote()">
        </app-on-fetch>
        <cdk-virtual-scroll-viewport style="flex-grow: 1"
                                     *ngIf="(salesState.fetchProductsProgress | async)===false"
                                     itemSize="{{(deviceState.isSmallScreen | async) ===true?'80': '30'}}">
          <mat-nav-list>
            <app-product-card style="margin: 0 3px; display: inline-block"
                              [cartdrawer]="cartdrawer"
                              [stock]="product"
                              (afterAddToCart)="afterAddToCart($event)"
                              [productIndex]="idx"
                              [isViewedInWholesale]="isViewedInWholesale"
                              *cdkVirtualFor="let product of salesState.products | async; let idx = index">
            </app-product-card>
            <div style="height: 200px"></div>
          </mat-nav-list>
        </cdk-virtual-scroll-viewport>
        <div class="bottom-actions-container">
          <button mat-button color="primary"
                  style="margin: 16px"
                  *ngIf="(salesState.fetchProductsProgress | async) === false && showRefreshCart === true"
                  (click)="getProductsRemote()"
                  matTooltip="Refresh products from server"
                  class="mat-fab">
            <mat-icon>refresh</mat-icon>
          </button>
          <span [ngStyle]="showRefreshCart?{flex: '1 1 auto'}:{}"></span>
          <app-cart-preview [cartSidenav]="cartdrawer" [isWholeSale]="isViewedInWholesale"></app-cart-preview>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['../styles/sale.style.css']
})
export class SaleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('cartdrawer') cartDrawer: MatDrawer;
  @Input() isViewedInWholesale = true;
  @Input() isViewedInInvoice = false;
  searchInputControl = new FormControl('', [Validators.nullValidator, Validators.required]);
  showRefreshCart = false;
  destroyer = new Subject<any>();

  constructor(public readonly snack: MatSnackBar,
              public readonly changeDetect: ChangeDetectorRef,
              public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              public readonly salesState: SalesState) {
  }

  async ngOnDestroy(): Promise<void> {
    this.salesState.stockListingStop();
    this.destroyer.next('done');
  }

  async ngOnInit(): Promise<void> {
    this.salesState.stockListening();
    this.salesState.getProducts();
    this.cartState.carts.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      this.showRefreshCart = value ? value.length === 0 : false;
    });
  }

  getProductsRemote(): void {
    this.salesState.getProductsRemote();
  }

  async filterProduct(query: string): Promise<void> {
    query = query ? query.trim() : '';
    this.salesState.search(query);
  }

  afterAddToCart($event: any): void {
    this.searchInputControl.setValue('');
  }

  ngAfterViewInit(): void {
    if (this.cartState.carts.value.length > 0) {
      this.cartDrawer.opened = true;
      this.changeDetect.detectChanges();
    }
  }
}
