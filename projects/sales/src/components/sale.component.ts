import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {SalesState} from '../states/sales.state';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';
import {StockModel} from '../models/stock.model';
import {DeviceState, LogService, StorageService} from '@smartstocktz/core-libs';
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
        <app-cart [isViewedInWholesale]="isViewedInWholesale" [cartdrawer]="cartdrawer"></app-cart>
      </mat-sidenav>
      <mat-sidenav-content style="display:flex; flex-direction: column">
        <app-toolbar (searchCallback)="filterProduct($event)"
                     [showSearch]="true"
                     [hasBackRoute]="true" [backLink]="'/sale/'"
                     searchPlaceholder="Filter product"
                     [searchInputControl]="searchInputControl"
                     [searchProgressFlag]="salesState.fetchProductsProgress | async"
                     [heading]="isViewedInInvoice ? 'Invoice' :isViewedInWholesale?'WholeSale':'Retail'"
                     [sidenav]="sidenav"
                     [cartDrawer]="cartdrawer"
                     [showProgress]="salesState.fetchProductsProgress | async">
        </app-toolbar>
        <app-on-fetch [isLoading]="salesState.fetchProductsProgress | async"
                      (refreshCallback)="getProductsRemote()">
        </app-on-fetch>
        <cdk-virtual-scroll-viewport style="flex-grow: 1"
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
                  *ngIf="(salesState.fetchProductsProgress | async) === false"
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
  searchInputControl = new FormControl('');
  showRefreshCart = false;
  destroyer = new Subject<any>();

  constructor(public readonly storage: StorageService,
              public readonly snack: MatSnackBar,
              public readonly logger: LogService,
              public readonly changeDetect: ChangeDetectorRef,
              public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              public readonly salesState: SalesState) {
  }

  async ngOnDestroy(): Promise<void> {
    this.destroyer.next('done');
  }

  async ngOnInit(): Promise<void> {
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
    // if (query === '') {
    //   this.getProducts();
    //   this.searchProgressFlag = false;
    //   return;
    // }
    // this.storage.getStocks().then(allStocks => {
    //   this.searchProgressFlag = false;
    //   if (allStocks) {
    //     // get index of stock by barcode
    //     const index = allStocks.findIndex((x: any) => {
    //       const barcode = x.barcode ? x.barcode : '';
    //       return query.trim() === barcode.trim();
    //     });
    //     if (index >= 0) {
    //       this.cartState.addToCart({
    //         // @ts-ignore
    //         product: allStocks[index],
    //         quantity: 1
    //       });
    //       this.searchInputControl.setValue('');
    //       if (this.deviceState.enoughWidth.value === true) {
    //         this.cartDrawer.open().catch();
    //       }
    //     } else {
    //       // @ts-ignore
    //       this.products = allStocks.filter((stock: StockModel) => {
    //           const barcode = stock.barcode ? stock.barcode : '';
    //           const productName = stock.product ? stock.product : '';
    //           const resembleProductName = productName.toString().trim().toLowerCase().includes(query.trim().toLowerCase());
    //           const equalToBarcode = query.trim() === barcode.trim();
    //           return (resembleProductName || equalToBarcode) && stock.saleable === true;
    //         }
    //       );
    //     }
    //   } else {
    //     this.snack.open('No products found, try again or refresh products', 'Ok', {
    //       duration: 3000
    //     });
    //   }
    // }).catch(reason => {
    //   this.searchProgressFlag = false;
    //   this.logger.i(reason);
    //   this.snack.open(reason, 'Ok');
    // });
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
