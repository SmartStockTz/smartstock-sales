import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatSidenav} from '@angular/material/sidenav';
import {CustomerState} from '../states/customer.state';
import {DeviceState, UserService} from '@smartstocktz/core-libs';
import {CartState} from '../states/cart.state';
import {CustomerModel} from '../models/customer.model';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DialogCreateCustomerComponent} from './dialog-create-customer.component';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {SheetCreateCustomerComponent} from './sheet-create-customer.component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DialogCashSaleCartOptionsComponent} from './dialog-cash-sale-cart-options.component';

@Component({
  selector: 'app-cart',
  template: `
    <div id="cart_view" [ngClass]="(deviceState.isSmallScreen | async)===true?'cart-mobile':'cart'">
      <mat-toolbar class="mat-elevation-z3" style="z-index: 10000">
        <span [matBadge]="cartState.cartTotalItems | async" matBadgeOverlap="false">Cart</span>
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
      <div style="padding-bottom: 500px">
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
        <div class="checkout-container">
          <button [disabled]="(cartState.checkoutProgress | async)===true" (click)="checkout()"
                  style="width: 100%;text-align:left;height: 48px;font-size: 18px" color="primary"
                  mat-flat-button>
            <span style="float: left;">{{cartState.cartTotal | async | fedha | async}}</span>
            <mat-progress-spinner *ngIf="(cartState.checkoutProgress | async)===true"
                                  mode="indeterminate"
                                  diameter="25"
                                  style="display: inline-block; float: right">
            </mat-progress-spinner>
            <span style="float: right" *ngIf="(cartState.checkoutProgress | async)===false">Checkout</span>
          </button>
          <button *ngIf="(cartState.checkoutProgress | async)===false"
                  (click)="openOptions()" mat-icon-button>
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../styles/cart.style.css']
})
export class CartComponent implements OnInit, OnDestroy {
  @Input() channel: 'retail' | 'whole' | 'credit' = 'retail';
  @Input() cartdrawer: MatSidenav;
  discountFormControl = new FormControl(
    0,
    [Validators.nullValidator, Validators.min(0)]
  );
  customerFormControl = new FormControl(
    '',
    [Validators.nullValidator, Validators.required, Validators.minLength(1)]
  );
  destroyer = new Subject();
  currentUser: any;

  constructor(public readonly userService: UserService,
              public readonly customerState: CustomerState,
              public readonly cartState: CartState,
              public readonly deviceState: DeviceState,
              public readonly snack: MatSnackBar,
              public readonly sheet: MatBottomSheet,
              private readonly dialog: MatDialog) {
  }

  ngOnDestroy(): void {
    this.cartState.dispose();
    this.customerState.customers.next([]);
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.customerFormControl.setValue(this.cartState.cartOrder.value?.customer?.displayName);
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
      this.cartState.totalItems();
    });
  }

  private discountListener(): void {
    this.discountFormControl.valueChanges.pipe(takeUntil(this.destroyer)).subscribe(value => {
      this.cartState.findTotal(this.channel, value);
    });
  }

  checkout(): void {
    if (!this.cartState.selectedCustomer.value && this.customerFormControl.value && this.customerFormControl.value !== '') {
      this.cartState.selectedCustomer.next({
        displayName: this.customerFormControl.value,
      });
      this.customerState.saveCustomer(this.cartState.selectedCustomer.value).catch(console.log);
    }
    if (this.channel === 'whole' && !this.cartState.selectedCustomer.value) {
      this.snack.open('Please enter customer name, or add a customer', 'Ok', {
        duration: 3000
      });
      return;
    }
    this.cartState
      .checkout(this.channel, this.discountFormControl.value, this.currentUser)
      .then(() => {
        this.discountFormControl.setValue(null);
        this.customerFormControl.setValue(null);
        this.setSelectedCustomer(null);
        this.cartState.carts.next([]);
      })
      .catch(console.log);
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
    this.cartState.selectedCustomer.next(customer);
  }

  openOptions() {
    this.dialog.open(DialogCashSaleCartOptionsComponent, {
      closeOnNavigation: true
    }).afterClosed().subscribe(value => {
      switch (value) {
        case 'order':
          this.cartState.saveOrder(this.channel, this.currentUser)
            .then(_3 => {
              this.cartState.clearCart();
              this.discountFormControl.setValue(0);
              this.customerFormControl.reset(null);
              this.setSelectedCustomer(null);
            }).catch(console.log);
          return;
        case 'print':
          this.cartState.printOnly(this.channel, this.discountFormControl.value).catch(console.log);
          return;
      }
    });
  }
}
