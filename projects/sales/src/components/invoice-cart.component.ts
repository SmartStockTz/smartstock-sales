import { Component, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatSidenav } from "@angular/material/sidenav";
import { CartDrawerState, DeviceState, UserService } from "smartstock-core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { CustomerState } from "../states/customer.state";
import { InvoiceState } from "../states/invoice.state";
import { InvoiceCartState } from "../states/invoice-cart.state";
import { StockState } from "../states/stock.state";
import { Router } from "@angular/router";
import { SaveInvoiceSheetComponent } from "./save-invoice-sheet.component";
import { SaveInvoiceDialogComponent } from "./save-invoice-dialog.component";
import { CustomerModel } from "../models/customer.model";
import { DialogInvoiceCartOptions } from "./dialog-invoice-cart-options";
import { CartState } from "../states/cart.state";

@Component({
  selector: "app-invoice-cart",
  template: `
    <div
      id="cart_view"
      [ngClass]="
        (deviceState.isSmallScreen | async) === true ? 'cart-mobile' : 'cart'
      "
    >
      <mat-toolbar class="mat-elevation-z3" style="z-index: 10000">
        <span
          [matBadge]="invoiceCartState.cartTotalItems | async"
          matBadgeOverlap="false"
          >Cart</span
        >
        <span style="flex-grow: 1;"></span>
        <button mat-icon-button (click)="drawer.toggle()" style="float: right;">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>
      <div style="padding: 5px 0 0 0">
        <div style="width: 100%; padding: 6px" class="row">
          <div class="flex-fill">
            <input
              class="supplier-input"
              [formControl]="supplierFormControl"
              placeholder="Customer"
              type="text"
              [matAutocomplete]="auto"
            />
            <mat-autocomplete #auto="matAutocomplete">
              <mat-option
                *ngFor="let option of suppliersDatasource.connect() | async"
                [value]="
                  option.displayName ? option.displayName : option.firstName
                "
                (click)="setSelectedSupplier(option)"
              >
                {{ option.displayName ? option.displayName : option.firstName }}
              </mat-option>
            </mat-autocomplete>
          </div>
        </div>
      </div>
      <div style="padding-bottom: 500px">
        <mat-list>
          <div
            *ngFor="let cart of invoiceCartState.carts | async; let i = index"
          >
            <mat-list-item matTooltip="{{ cart.stock.product }}">
              <button
                (click)="invoiceCartState.removeItemFromCart(i)"
                matSuffix
                mat-icon-button
              >
                <mat-icon color="warn">delete</mat-icon>
              </button>
              <h4 matLine class="text-truncate">{{ cart.stock.product }}</h4>
              <mat-card-subtitle matLine>
                {{ cart.quantity | number }} {{ cart.stock.unit }} @
                {{ cart.amount | number }} =
                {{ cart.quantity * cart.amount | number }}
              </mat-card-subtitle>
              <div class="d-flex flex-row" matLine>
                <button
                  color="primary"
                  (click)="invoiceCartState.decrementCartItemQuantity(i)"
                  mat-icon-button
                >
                  <mat-icon>remove_circle</mat-icon>
                </button>
                <button
                  color="primary"
                  (click)="invoiceCartState.incrementCartItemQuantity(i)"
                  mat-icon-button
                >
                  <mat-icon>add_circle</mat-icon>
                </button>
              </div>
            </mat-list-item>
            <mat-divider
              style="margin-left: 5%; margin-right: 5%; margin-top: 4px"
            ></mat-divider>
          </div>
        </mat-list>
      </div>
      <div
        style="padding: 8px 8px 16px 8px;bottom: 0;width: 100%;position: absolute;background-color: white;z-index: 1000;"
      >
        <mat-divider style="margin-bottom: 7px"></mat-divider>
        <div class="checkout-container">
          <button
            [disabled]="(invoiceState.addInvoiceProgress | async) === true"
            (click)="checkout()"
            style="width: 100%;text-align:left;height: 48px;font-size: 18px"
            color="primary"
            mat-flat-button
          >
            <span style="float: left;">{{
              invoiceCartState.cartTotal | async | number
            }}</span>
            <mat-progress-spinner
              *ngIf="(invoiceState.addInvoiceProgress | async) === true"
              mode="indeterminate"
              diameter="25"
              style="display: inline-block; float: right"
            >
            </mat-progress-spinner>
            <span
              style="float: right"
              *ngIf="(invoiceState.addInvoiceProgress | async) === false"
              >Record</span
            >
          </button>
          <button *ngIf="(invoiceState.addInvoiceProgress | async) === false"
                  (click)="openOptions()" mat-icon-button>
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["../styles/invoice-cart.style.scss"]
})
export class InvoiceCartComponent implements OnInit, OnDestroy {
  drawer: MatSidenav;
  supplierFormControl = new UntypedFormControl("", [
    Validators.nullValidator,
    Validators.required,
    Validators.minLength(1)
  ]);
  destroyer = new Subject();
  currentUser: any;
  suppliersDatasource = new MatTableDataSource([]);

  constructor(
    public readonly userService: UserService,
    public readonly customerState: CustomerState,
    public readonly invoiceCartState: InvoiceCartState,
    public readonly deviceState: DeviceState,
    public readonly snack: MatSnackBar,
    public readonly cartDrawerState: CartDrawerState,
    public readonly invoiceState: InvoiceState,
    public readonly stockState: StockState,
    private readonly dialog: MatDialog,
    private readonly route: Router,
    public readonly sheet: MatBottomSheet
  ) {}

  ngOnDestroy(): void {
    this.customerState.customers.next([]);
    this.destroyer.next("done");
  }

  ngOnInit(): void {
    this.handleSupplierNameControl();
    this.cartDrawerState.drawer
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        if (value) {
          this.drawer = value;
        }
      });
    this.customerState.customers
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        if (Array.isArray(value)) {
          this.suppliersDatasource.data = value;
        }
      });
    this.invoiceCartState.carts
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        if (Array.isArray(value)) {
          this.invoiceCartState.findTotal(value);
        }
      });
  }

  private handleSupplierNameControl(): void {
    this.supplierFormControl.valueChanges
      .pipe(takeUntil(this.destroyer))
      .subscribe((enteredName: string) => {
        if (enteredName !== null) {
          this.suppliersDatasource.filter = enteredName;
        }
      });
  }

  isCustomerSelected(): boolean{
    if (
      !this.invoiceCartState.selectedCustomer.value &&
      this.supplierFormControl.value &&
      this.supplierFormControl.value !== ""
    ) {
      this.supplierFormControl.setValue("");
    }
    if (!this.invoiceCartState.selectedCustomer.value) {
      this.snack.open("Please select customer", "", {
        duration: 3000
      });
      return false;
    }
    return true;
  }

  checkout(): void {
    if(!this.isCustomerSelected())return;
    if (this.deviceState.isSmallScreen.value === true) {
      this.sheet.open(SaveInvoiceSheetComponent, {
        closeOnNavigation: true
      });
    } else {
      this.dialog.open(SaveInvoiceDialogComponent, {
        closeOnNavigation: true,
        width: "500px"
      });
    }
  }

  setSelectedSupplier(option: CustomerModel) {
    this.invoiceCartState.selectedCustomer.next(option);
  }

  openOptions() {
    if(!this.isCustomerSelected()) return;
    this.dialog
      .open(DialogInvoiceCartOptions, {
        closeOnNavigation: true
      })
      .afterClosed()
      .subscribe((value) => {
        switch (value) {
          case "profoma":
            this.invoiceState.addInvoiceProgress.next(true);
            this.invoiceCartState
              .saveProfoma(this.currentUser)
              .then((_3) => {
                this.supplierFormControl.reset(null);
                this.route.navigateByUrl('/sale/order');
              })
              .catch(console.log)
              .finally(()=>{
                this.invoiceState.addInvoiceProgress.next(false);
              });
            return;
        }
      });
  }

}
