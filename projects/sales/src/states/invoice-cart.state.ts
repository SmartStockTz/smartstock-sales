import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PrintService } from "smartstock-core";
import { Router } from "@angular/router";
import { InvoiceItemModel } from "../models/invoice-item.model";
import { InvoiceService } from "../services/invoice.services";
import { InvoiceCartService } from "../services/invoice-cart.service";
import { CustomerModel } from "../models/customer.model";

@Injectable({
  providedIn: "root"
})
export class InvoiceCartState {
  carts = new BehaviorSubject<InvoiceItemModel[]>([]);
  cartTotal = new BehaviorSubject(0);
  cartTotalItems = new BehaviorSubject(0);
  selectedCustomer = new BehaviorSubject<CustomerModel>(null);

  constructor(
    private readonly invoiceCartService: InvoiceCartService,
    private readonly printService: PrintService,
    private readonly invoiceService: InvoiceService,
    private readonly router: Router,
    private readonly snack: MatSnackBar
  ) {}

  private message(reason) {
    this.snack.open(
      reason && reason.message ? reason.message : reason.toString(),
      "Ok",
      {
        duration: 2000
      }
    );
  }

  addToCart(cart: InvoiceItemModel): void {
    this.invoiceCartService
      .addToCart(this.carts.value, cart)
      .then((value) => {
        this.carts.next(value);
      })
      .catch((reason) => {
        this.message(reason);
      });
  }

  findTotal(carts: InvoiceItemModel[]) {
    this.totalItems();
    this.invoiceCartService
      .findTotal(carts)
      .then((value) => {
        this.cartTotal.next(value);
      })
      .catch((reason) => {
        this.message(reason);
      });
  }

  totalItems(): void {
    this.cartTotalItems.next(
      this.carts.value
        .map((cartItem) => cartItem.quantity)
        .reduce((a, b) => a + b, 0)
    );
  }

  incrementCartItemQuantity(indexOfProductInCart: number): void {
    this.carts.value[indexOfProductInCart].quantity =
      this.carts.value[indexOfProductInCart].quantity + 1;
    this.carts.next(this.carts.value);
  }

  decrementCartItemQuantity(indexOfProductInCart: number): void {
    if (this.carts.value[indexOfProductInCart].quantity > 1) {
      this.carts.value[indexOfProductInCart].quantity =
        this.carts.value[indexOfProductInCart].quantity - 1;
      this.carts.next(this.carts.value);
    }
  }

  removeItemFromCart(indexOfProductInCart: number): void {
    this.carts.value.splice(indexOfProductInCart, 1);
    this.carts.next(this.carts.value);
  }

  dispose() {
    this.carts.next([]);
    this.cartTotal.next(0);
    this.cartTotalItems.next(0);
    this.selectedCustomer.next(null);
  }
}
