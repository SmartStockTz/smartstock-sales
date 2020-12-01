import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDrawer, MatSidenav} from '@angular/material/sidenav';
import {Router} from '@angular/router';
import {SalesState} from '../states/sales.state';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';
import {StockModel} from '../models/stock.model';
import {DeviceInfoUtil, LogService, StorageService} from '@smartstocktz/core-libs';
import {ConfigsService} from '../services/config.service';
import {UserService} from '../user-modules/user.service';
import {CartState} from '../states/cart.state';

@Component({
  selector: 'smartstock-sale',
  template: `
    <mat-sidenav-container class="match-parent">

      <mat-sidenav class="match-parent-side" #sidenav [mode]="enoughWidth()?'side':'over'" [opened]="enoughWidth()">
        <smartstock-drawer></smartstock-drawer>
      </mat-sidenav>

      <mat-sidenav #cartdrawer [fixedInViewport]="false" position="end" [mode]="enoughWidth()?'side':'over'"
                   [opened]="false">
        <smartstock-cart  [isViewedInWholesale]="isViewedInWholesale" [cartdrawer]="cartdrawer"></smartstock-cart>
      </mat-sidenav>

      <mat-sidenav-content style="display:flex; flex-direction: column">

        <smartstock-toolbar (searchCallback)="filterProduct($event)"
                            [showSearch]="true"
                            [hasBackRoute]="true" [backLink]="'/sale/'"
                            searchPlaceholder="Filter product"
                            [searchInputControl]="searchInputControl"
                            [searchProgressFlag]="searchProgressFlag"
                            [heading]="isViewedInInvoice ? 'Invoice' :isViewedInWholesale?'WholeSale':'Retail'" [sidenav]="sidenav"
                            [cartDrawer]="cartdrawer"
                            [showProgress]="showProgress"></smartstock-toolbar>

        <smartstock-on-fetch *ngIf="!products || fetchDataProgress" [isLoading]="fetchDataProgress"
                             (refreshCallback)="getProductsFromServer()"></smartstock-on-fetch>

        <cdk-virtual-scroll-viewport style="flex-grow: 1" itemSize="25" *ngIf="products && !fetchDataProgress">
          <smartstock-product-card style="margin: 0 5px; display: inline-block"
                                   [cartdrawer]="cartdrawer"
                                   [product]="product"
                                   (afterAddToCart)="afterAddToCart($event)"
                                   [productIndex]="idx"
                                   [isViewedInWholesale]="isViewedInWholesale"
                                   *cdkVirtualFor="let product of products; let idx = index">
          </smartstock-product-card>
        </cdk-virtual-scroll-viewport>

        <div style="position: absolute; width: 100%;display: flex; flex-direction: row; justify-content: center;
        flex-wrap: wrap;
           align-items: center; z-index: 3000; left: 0; bottom: 0; right: 0;">
          <button mat-button color="primary"
                  style="margin: 16px"
                  *ngIf="!fetchDataProgress && products && showRefreshCart"
                  (click)="getProductsFromServer()"
                  matTooltip="Refresh products from server"
                  class="mat-fab">
            <mat-icon>refresh</mat-icon>
          </button>
          <span [ngStyle]="showRefreshCart?{flex: '1 1 auto'}:{}"></span>
          <smartstock-cart-preview [cartSidenav]="cartdrawer" [isWholeSale]="isViewedInWholesale"></smartstock-cart-preview>
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styleUrls: ['../styles/sale.style.css'],
  providers: [
    SalesState,
    UserService
  ]
})
export class SaleComponent extends DeviceInfoUtil implements OnInit, AfterViewInit {
  products: StockModel[] = undefined;
  fetchDataProgress = false;
  showProgress = false;
  @ViewChild('sidenav') sidenav: MatSidenav;
  searchProgressFlag = false;
  @Input() isViewedInWholesale = true;
  @Input() isViewedInInvoice = false;
  isMobile = ConfigsService.android;
  searchInputControl = new FormControl('');
  showRefreshCart = false;
  @ViewChild('cartdrawer') cartDrawer: MatDrawer;

  constructor(private readonly router: Router,
              private readonly userDatabase: UserService,
              private readonly storage: StorageService,
              private readonly snack: MatSnackBar,
              private readonly logger: LogService,
              private readonly changeDetect: ChangeDetectorRef,
              private readonly cartState: CartState,
              private readonly salesState: SalesState,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getProducts();
    this.showRefreshCart = this.cartState.carts.value.length === 0;
  }

  getProductsFromServer(): void {
    this.fetchDataProgress = true;
    this.salesState.getAllStock().then(products => {
      this.fetchDataProgress = false;
      this.products = products.filter(x => x.saleable === true);
    }).catch(reason => {
      this.fetchDataProgress = false;
      this.logger.i(reason);
    });
  }

  getProducts(): void {
    this.fetchDataProgress = true;
    this.products = undefined;
    this.storage.getStocks().then(products => {
      this.fetchDataProgress = false;
      if (products && products.length > 0) {
        this.products = products.filter(x => x.saleable === true);
      }
    }).catch(reason => {
      this.fetchDataProgress = false;
      this.logger.i(reason);
    });
  }

  filterProduct(query: string): void {
    query = query ? query.trim() : '';
    this.searchProgressFlag = true;
    if (query === '') {
      this.getProducts();
      this.searchProgressFlag = false;
      return;
    }
    this.storage.getStocks().then(allStocks => {
      this.searchProgressFlag = false;
      if (allStocks) {
        // get index of product by barcode
        const index = allStocks.findIndex((x: StockModel) => {
          const barcode = x.barcode ? x.barcode : '';
          return query.trim() === barcode.trim();
        });
        if (index >= 0) {
          this.cartState.addToCart({
            product: allStocks[index],
            quantity: 1
          });
          this.searchInputControl.setValue('');
          if (this.enoughWidth()) {
            this.cartDrawer.open().catch();
          }
        } else {
          this.products = allStocks.filter((stock: StockModel) => {
              const barcode = stock.barcode ? stock.barcode : '';
              const productName = stock.product ? stock.product : '';
              const resembleProductName = productName.trim().toLowerCase().includes(query.trim().toLowerCase());
              const equalToBarcode = query.trim() === barcode.trim();
              return (resembleProductName || equalToBarcode) && stock.saleable === true;
            }
          );
        }
      } else {
        this.snack.open('No products found, try again or refresh products', 'Ok', {
          duration: 3000
        });
      }
    }).catch(reason => {
      this.searchProgressFlag = false;
      this.logger.i(reason);
      this.snack.open(reason, 'Ok');
    });
  }

  afterAddToCart($event: any): void {
    this.searchInputControl.setValue('');
  }

  ngAfterViewInit(): void {
    if (this.cartState.carts.value.length > 0) {
      this.cartDrawer.opened = true; // ().catch();
      this.changeDetect.detectChanges();
    }
  }
}
