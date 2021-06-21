import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
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
import {CreateCustomerComponent} from './create-customer-form.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

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
              <mat-option *ngFor="let option of customers | async" [value]="option.firstName + ' ' + option.secondName"
                          (click)="setSelectedCustomer(option)">
                {{option.firstName + " " + option.secondName}}
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
              <button (click)="removeCart(i)" matSuffix mat-icon-button>
                <mat-icon color="warn">delete</mat-icon>
              </button>
              <h4 matLine class="text-wrap">{{cart.product.product}}</h4>
              <mat-card-subtitle
                matLine>{{isViewedInWholesale ? '(' + cart.product.wholesaleQuantity + ') ' : ''}}{{cart.quantity}} {{cart.product.unit}}
                @{{isViewedInWholesale ? cart.product.wholesalePrice : cart.product.retailPrice}}
                = {{cart.quantity * (isViewedInWholesale ? cart.product.wholesalePrice : cart.product.retailPrice) | number}}
              </mat-card-subtitle>
              <div class="d-flex flex-row" matLine>
                <button color="primary" (click)="decrementQty(i)" mat-icon-button>
                  <mat-icon>remove_circle</mat-icon>
                </button>
                <button color="primary" (click)="incrementQty(i)" mat-icon-button>
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
            <span>{{totalCost | currency: 'TZS '}}</span>
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
          <span style="float: left;">{{totalCost | currency: 'TZS '}}</span>
          <mat-progress-spinner color="primary" *ngIf="checkoutProgress" mode="indeterminate" diameter="25"
                                style="display: inline-block"></mat-progress-spinner>
          <span style="float: right" *ngIf="!checkoutProgress">Checkout</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['../styles/cart.style.css'],
  providers: [
    SalesState,
    SettingsService
  ]
})
export class CartComponent implements OnInit {

  constructor(private readonly salesState: SalesState,
              private readonly settingsService: SettingsService,
              private readonly printService: PrintService,
              private readonly userService: UserService,
              private readonly customerState: CustomerState,
              public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              public readonly snack: MatSnackBar,
              private readonly dialog: MatDialog) {
  }

  @Input() isViewedInWholesale = false;
  @Input() cartdrawer: MatSidenav;

  totalCost = 0;
  discountFormControl = new FormControl(0, [Validators.nullValidator, Validators.min(0)]);
  customerFormControl = new FormControl('', [Validators.nullValidator, Validators.required, Validators.minLength(3)]);
  customers: Observable<CustomerModel[]>;
  selectedCustomer: CustomerModel;
  customersArray: string[];
  checkoutProgress = false;
  private currentUser: any;

  static _getCartItemDiscount(data: { totalDiscount: number, totalItems: number }): number {
    return (data.totalDiscount / data.totalItems);
  }

  static getQuantity(isViewedInWholesale: boolean, cart: CartModel): number {
    return isViewedInWholesale ? (cart.quantity * cart.stock.wholesaleQuantity) : cart.quantity;
  }

  static getPrice(isViewedInWholesale: boolean, cart: CartModel): number {
    return isViewedInWholesale ? cart.stock.wholesalePrice : cart.stock.retailPrice;
  }

  ngOnInit(): void {
    this.getUser();
    this._cartListener();
    this._discountListener();
    this._getCustomers();
    this._handleCustomerNameControl();

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

  private _handleCustomerNameControl(): void {
    this.customersArray = [];
    this.customerFormControl.valueChanges.subscribe((enteredName: string) => {
      if (enteredName !== null) {
        this.customerState.customers$.subscribe(
          customers => {
            this.customers = of(customers
              .filter(customer => {
                const name = customer.firstName ?
                  customer.firstName + ' ' + customer.secondName : customer.displayName;
                return name.toLowerCase().includes(enteredName.toLowerCase());
              }));
          }
        );
      }
    });
  }

  private _cartListener(): void {
    this.cartState.carts.subscribe(_ => {
      if (!_ || (_ && _.length === 0)) {
        this.cartdrawer.opened = false;
      }
      this._getTotal(this.discountFormControl.value ? this.discountFormControl.value : 0);
    });
  }

  getTotalCartItem(): number {
    return this.cartState.carts.value.map(cartItem => cartItem.quantity).reduce((a, b) => a + b, 0);
  }

  private _getTotal(discount: number): void {
    this.totalCost = this.cartState.carts.value
      .map<number>(value => {
        return value.quantity * (this.isViewedInWholesale ? value.product.wholesalePrice : value.product.retailPrice) as number;
      })
      .reduce((a, b) => {
        return a + b;
      }, (discount && typeof discount === 'number') ? -discount : 0);
  }

  decrementQty(indexOfProductInCart: number): void {
    this.cartState.decrementCartItemQuantity(indexOfProductInCart);
  }

  incrementQty(indexOfProductInCart: number): void {
    this.cartState.incrementCartItemQuantity(indexOfProductInCart);
  }

  removeCart(indexOfProductInCart: number): void {
    this.cartState.removeItemFromCart(indexOfProductInCart);
  }

  private _discountListener(): void {
    this.discountFormControl.valueChanges.subscribe(value => {
      if (!value) {
        this._getTotal(0);
      }
      if (!isNaN(value)) {
        this._getTotal(value);
      }
    });
  }

  checkout(): void {
    if (this.isViewedInWholesale && !this.selectedCustomer) {
      this.snack.open('Please enter customer name, or add a customer', 'Ok', {
        duration: 3000
      });
      return;
    }
    this.checkoutProgress = true;
    // if (this.customerFormControl.valid) {
    //   this.customerState.saveCustomer({
    //     displayName: this.customerFormControl.value,
    //   }).catch();
    // }
    this.printCart();
  }

  private _getCartItemSubAmount(cart: { quantity: number, product: StockModel, totalDiscount: number, totalItems: number }): number {
    const amount = this.isViewedInWholesale
      ? (cart.quantity * cart.product.wholesalePrice)
      : (cart.quantity * cart.product.retailPrice);
    return amount - CartComponent._getCartItemDiscount({totalDiscount: cart.totalDiscount, totalItems: cart.totalItems});
  }

  async submitBill(cartId: string): Promise<void> {
    const sales: SalesModel[] = await this._getSalesBatch();
    await this.salesState.saveSales(sales, cartId);
    this.cartState.carts.next([]);
    this.customerFormControl.setValue(null);
    this._getTotal(0);
  }

  printCart(): void {
    this.checkoutProgress = true;
    const cartId = SecurityUtil.generateUUID();
    const cartItems = this._getCartItems();
    this.printService.print({
      data: this.cartItemsToPrinterData(cartItems, this.selectedCustomer ? this.selectedCustomer.firstName + ' ' + this.selectedCustomer.secondName : ' '),
      printer: 'tm20',
      id: cartId,
      qr: cartId
    }).then(_ => {
      return this.submitBill(cartId);
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
    });
  }

  private cartItemsToPrinterData(carts: CartModel[], customer: string): string {
    let data = '';
    data = data.concat('-------------------------------\n');
    data = data.concat(new Date().toDateString() + '\n');
    if (customer) {
      data = data.concat('-------------------------------\nTo ---> ' + customer);
    }
    let totalBill = 0;
    carts.forEach((cart, index) => {
      totalBill += (cart.amount as number);
      data = data.concat(
        '\n-------------------------------\n' +
        (index + 1) + '.  ' + cart.product + '\n' +
        'Quantity --> ' + CartComponent.getQuantity(this.isViewedInWholesale, cart) + ' ' + cart.stock.unit + ' \t' +
        'Unit Price --> ' + CartComponent.getPrice(this.isViewedInWholesale, cart) + '\t' +
        'Sub Amount  --> ' + cart.amount + ' \t'
      );
    });
    data = data.concat(
      '\n--------------------------------\n' +
      'Total Bill : ' + totalBill +
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
    const channel = this.isViewedInWholesale ? 'whole' : 'retail';
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
        quantity: this.isViewedInWholesale
          ? (value.quantity * value.product.wholesaleQuantity)
          : value.quantity,
        product: value.product.product,
        category: value.product.category,
        unit: value.product.unit,
        channel,
        date: stringDate,
        idTra,
        customer: this.selectedCustomer ? this.selectedCustomer.firstName + ' ' + this.selectedCustomer.secondName : '',
        customerObject: this.selectedCustomer,
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
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      height: '400px',
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  private _getCustomers(): void {
    // if (!this.isViewedInWholesale) {
    //   return;
    // }

    this.customerState.customers$.subscribe(
      customers => {
        if (!customers) {
          customers = [];
        }

        // this.customers = of(customers.map(value => value.displayName));
        this.customers = of(customers);
      }
    );
  }

  setSelectedCustomer(option: CustomerModel) {
    // console.log(option);
    this.selectedCustomer = option;
  }
}
