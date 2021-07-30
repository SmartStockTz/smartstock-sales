import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatSidenav} from '@angular/material/sidenav';
import {SalesState} from '../states/sales.state';
import {SalesModel} from '../models/sale.model';
import {CartModel} from '../models/cart.model';
import {CustomerState} from '../states/customer.state';
import {DeviceState, PrintService, SecurityUtil, SettingsService, toSqlDate, UserService} from '@smartstocktz/core-libs';
import {StockModel} from '../models/stock.model';
import {CartState} from '../states/cart.state';
import * as moment from 'moment';
import {CustomerModel} from '../models/customer.model';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DialogCreateCustomerComponent} from './dialog-create-customer.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {SheetCreateCustomerComponent} from './sheet-create-customer.component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  template: `
    <div id="cart_view" [ngClass]="(deviceState.isSmallScreen | async)===true?'cart-mobile':'cart'">
      <mat-toolbar class="mat-elevation-z3" style="z-index: 10000">
        <span [matBadge]="getTotalCartItem().toString()" matBadgeOverlap="false">Cart</span>
        <span style="flex-grow: 1;"></span>
        <button mat-icon-button (click)="cartdrawer.toggle()" style="float: right;">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>
      <div style="padding: 5px 0 0 0">
        <div style="width: 100%; padding: 6px" class="row">
          <div class="flex-fill">
            <input autocomplete="false"
                   style="border: none; background-color: rgba(0, 170, 7, 0.1);
           padding: 4px; border-radius: 4px;width: 100%; height: 48px;"
                   [formControl]="customerFormControl" placeholder="Customer Name"
                   type="text" [matAutocomplete]="auto">
            <mat-autocomplete #auto="matAutocomplete">
              <mat-option *ngFor="let option of customerState.customers | async" [value]="option.displayName"
                          (click)="setSelectedCustomer(option)">
                {{option.displayName}}
              </mat-option>
            </mat-autocomplete>
          </div>
          <button color="primary" (click)="createCustomer()" mat-icon-button>
            <mat-icon>add_circle_outline</mat-icon>
          </button>
        </div>
      </div>
      <div style="margin-bottom: 300px">
        <mat-list>
          <div *ngFor="let cart of cartState.carts | async; let i=index">
            <mat-list-item>
              <button (click)="cartState.removeItemFromCart(i)" matSuffix mat-icon-button>
                <mat-icon color="warn">delete</mat-icon>
              </button>
              <h4 matLine class="text-wrap">{{cart.product.product}}</h4>
              <mat-card-subtitle matLine>
                {{channel === 'whole' ? ('(' + cart.product.wholesaleQuantity + ') x ') : ''}}{{cart.quantity}} {{cart.product.unit}}
                @{{channel === 'whole' ? cart.product.wholesalePrice : cart.product.retailPrice}}
                = {{cart.quantity * (channel === 'whole' ? cart.product.wholesalePrice : cart.product.retailPrice) | number}}
              </mat-card-subtitle>
              <div class="d-flex flex-row" matLine>
                <button color="primary" (click)="cartState.decrementCartItemQuantity(i)" mat-icon-button>
                  <mat-icon>remove_circle</mat-icon>
                </button>
                <button color="primary" (click)="cartState.incrementCartItemQuantity(i)" mat-icon-button>
                  <mat-icon>add_circle</mat-icon>
                </button>
              </div>
            </mat-list-item>
            <mat-divider style="margin-left: 5%; margin-right: 5%; margin-top: 4px"></mat-divider>
          </div>
        </mat-list>
      </div>
      <div style="padding: 8px 8px 16px 8px;bottom: 0;width: 100%;position: absolute;background-color: white;z-index: 1000;">
        <mat-divider style="margin-bottom: 7px"></mat-divider>
        <div class="cart-total">
          <h6 style="display: flex;">
            <span style="flex-grow: 1;">Total</span>
            <span>{{cartState.cartTotal | async | fedha | async}}</span>
          </h6>
          <p style="color: #868688;display: flex;">
            <span style="flex-grow: 1;">Discount( TZS )</span>
            <input autocomplete="false"
                   style="border: none; text-align: center;background-color: rgba(0, 170, 7, 0.1);
              border-radius: 4px;width: 125px; height: 35px;"
                   type="number" min="0" [formControl]="discountFormControl">
          </p>
        </div>
        <button [disabled]="checkoutProgress" (click)="checkout()"
                style="width: 100%;text-align:left;height: 48px;font-size: 18px" color="primary"
                mat-raised-button>
          <span style="float: left;">{{cartState.cartTotal | async | fedha | async}}</span>
          <mat-progress-spinner color="primary" *ngIf="checkoutProgress" mode="indeterminate" diameter="25"
                                style="display: inline-block"></mat-progress-spinner>
          <span style="float: right" *ngIf="!checkoutProgress">Checkout</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['../styles/cart.style.css']
})
export class CartComponent implements OnInit, OnDestroy {

  // @Input() isViewedInWholesale = false;
  @Input() channel: 'retail' | 'whole' | 'credit' = 'retail';
  @Input() cartdrawer: MatSidenav;
  discountFormControl = new FormControl(0,
    [Validators.nullValidator, Validators.min(0)]);
  customerFormControl = new FormControl('',
    [Validators.nullValidator, Validators.required, Validators.minLength(1)]);
  selectedCustomer: CustomerModel;
  customersArray: string[];
  checkoutProgress = false;
  destroyer = new Subject();
  private currentUser: any;

  constructor(private readonly salesState: SalesState,
              private readonly settingsService: SettingsService,
              private readonly printService: PrintService,
              private readonly userService: UserService,
              public readonly customerState: CustomerState,
              public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              public readonly snack: MatSnackBar,
              public readonly sheet: MatBottomSheet,
              private readonly dialog: MatDialog) {
  }

  static _getCartItemDiscount(data: { totalDiscount: number, totalItems: number }): number {
    return (data.totalDiscount / data.totalItems);
  }

  static getQuantity(isViewedInWholesale: boolean, cart: CartModel): number {
    return isViewedInWholesale ? (cart.quantity * cart.stock.wholesaleQuantity) : cart.quantity;
  }

  static getPrice(isViewedInWholesale: boolean, cart: CartModel): number {
    return isViewedInWholesale ? cart.stock.wholesalePrice : cart.stock.retailPrice;
  }

  ngOnDestroy(): void {
    this.customerState.customers.next([]);
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.customerState.fetchCustomers();
    this.getUser();
    this.cartListener();
    this.discountListener();
    this.handleCustomerNameControl();
  }

  private getUser(): void {
    this.userService.currentUser()
      .then(value => {
        this.currentUser = value;
      })
      .catch(_ => {
        this.currentUser = undefined;
      });
  }

  private handleCustomerNameControl(): void {
    this.customersArray = [];
    this.customerFormControl.valueChanges
      .pipe(takeUntil(this.destroyer))
      .subscribe((enteredName: string) => {
          if (enteredName !== null) {
            this.customerState.search(enteredName);
          }
        }
      );
  }

  private cartListener(): void {
    this.cartState.carts.pipe(takeUntil(this.destroyer)).subscribe(_ => {
      if (!_ || (_ && _.length === 0)) {
        this.cartdrawer.opened = false;
      }
      this.cartState.findTotal(this.channel, this.discountFormControl.value);
    });
  }

  getTotalCartItem(): number {
    return this.cartState.carts.value.map(cartItem => cartItem.quantity).reduce((a, b) => a + b, 0);
  }

  private discountListener(): void {
    this.discountFormControl.valueChanges.pipe(takeUntil(this.destroyer)).subscribe(value => {
      this.cartState.findTotal(this.channel, value);
    });
  }

  checkout(): void {
    if (!this.selectedCustomer
      && this.customerFormControl.value
      && this.customerFormControl.value !== '') {
      this.selectedCustomer = {
        displayName: this.customerFormControl.value,
      };
      this.customerState.saveCustomer({
        displayName: this.selectedCustomer.displayName,
      }).catch(console.log);
    }
    if (this.channel === 'whole' && (!this.selectedCustomer || !this.customerFormControl.valid)) {
      this.snack.open('Please enter customer name, or add a customer', 'Ok', {
        duration: 3000
      });
      return;
    }
    this.checkoutProgress = true;
    this.printCart();
  }

  private _getCartItemSubAmount(cart: { quantity: number, product: StockModel, totalDiscount: number, totalItems: number }): number {
    const amount = this.channel === 'whole'
      ? (cart.quantity * cart.product.wholesalePrice)
      : (cart.quantity * cart.product.retailPrice);
    return amount - CartComponent._getCartItemDiscount({totalDiscount: cart.totalDiscount, totalItems: cart.totalItems});
  }

  async submitBill(): Promise<void> {
    const sales: SalesModel[] = await this._getSalesBatch();
    await this.salesState.saveSales(sales);
    this.cartState.carts.next([]);
    this.customerFormControl.setValue(null);
    this.discountFormControl.setValue(0);
    this.cartState.findTotal(this.channel, this.discountFormControl.value);
  }

  printCart(): void {
    this.checkoutProgress = true;
    const cartItems = this._getCartItems();
    this.printService.print({
      data: this.cartItemsToPrinterData(cartItems,
        this.selectedCustomer ? this.selectedCustomer?.displayName : 'N/A'),
      printer: 'tm20',
      id: SecurityUtil.generateUUID(),
      qr: null
    }).then(_ => {
      return this.submitBill();
    }).then(_ => {
      this.checkoutProgress = false;
      this.snack.open('Done save sales', 'Ok', {duration: 2000});
    }).catch(reason => {
      this.checkoutProgress = false;
      this.snack.open(
        reason && reason.message ? reason.message : reason.toString(),
        'Ok',
        {duration: 3000}
      );
    }).finally(() => {
      this.discountFormControl.setValue(0);
      this.selectedCustomer = null;
      this.checkoutProgress = false;
    });
  }

  private cartItemsToPrinterData(carts: CartModel[], customer: string): string {
    let data = '';
    data = data.concat('-------------------------------\n');
    data = data.concat(new Date().toDateString());
    if (customer) {
      data = data.concat('\n-------------------------------\nCUSTOMER : ' + customer + '\n');
    }
    let totalBill = 0;
    carts.forEach((cart, index) => {
      totalBill += (cart.amount as number);
      data = data.concat(
        `------------------------------------
ITEM : ${cart.product}
QUANTITY : ${CartComponent.getQuantity(this.channel === 'whole', cart)} / ${cart.stock.unit}
SUB TOTAL : ${cart.amount}, UNIT PRICE ${CartComponent.getPrice(this.channel === 'whole', cart)}
        \n`
      );
    });
    data = data.concat(
      '--------------------------------\n' +
      'TOTAL AMOUNT : ' + totalBill +
      '\n--------------------------------\n'
    );
    return data;
  }

  private _getCartItems(): CartModel[] {
    return this.cartState.carts.value.map<CartModel>(value => {
      return {
        amount: this._getCartItemSubAmount({
          totalItems: this.cartState.carts.value.length,
          totalDiscount: this.discountFormControl.value,
          product: value.product,
          quantity: value.quantity
        }),
        product: value.product.product,
        quantity: value.quantity,
        stock: value.product,
        discount: CartComponent._getCartItemDiscount({
          totalItems: this.cartState.carts.value.length,
          totalDiscount: this.discountFormControl.value,
        })
      };
    });
  }

  private async _getSalesBatch(): Promise<SalesModel[]> {
    const stringDate = toSqlDate(new Date());
    const idTra = 'n';
    const channel = this.channel;
    const sales: SalesModel[] = [];
    this.cartState.carts.value.forEach(value => {
      sales.push({
        amount: this._getCartItemSubAmount({
          totalItems: this.cartState.carts.value.length,
          totalDiscount: this.discountFormControl.value,
          product: value.product,
          quantity: value.quantity
        }),
        discount: CartComponent._getCartItemDiscount({
          totalItems: this.cartState.carts.value.length,
          totalDiscount: this.discountFormControl.value,
        }),
        quantity: this.channel === 'whole'
          ? (value.quantity * value.product.wholesaleQuantity)
          : value.quantity,
        product: value.product.product,
        category: value.product.category,
        unit: value.product.unit,
        channel,
        date: stringDate,
        idTra,
        customer: this.selectedCustomer ? this.selectedCustomer?.displayName : '',
        customerObject: {
          displayName: this.selectedCustomer ? this.selectedCustomer.displayName : '',
          email: this.selectedCustomer?.email,
          firstName: this.selectedCustomer?.displayName,
          lastName: this.selectedCustomer?.displayName,
          mobile: this.selectedCustomer?.phone
        },
        soldBy: {
          username: this.currentUser.username
        },
        timer: moment(new Date()).format('YYYY-MM-DDTHH:mm'),
        user: this.currentUser?.id,
        sellerObject: this.currentUser,
        stock: value.product,
        stockId: value.product.id
      });
    });
    return sales;
  }

  createCustomer() {
    if (this.deviceState.isSmallScreen.value === true) {
      this.sheet.open(SheetCreateCustomerComponent);
      return;
    }
    this.dialog.open(DialogCreateCustomerComponent, {
      maxWidth: '500px'
    });
  }

  setSelectedCustomer(customer: CustomerModel) {
    this.selectedCustomer = customer;
  }
}
