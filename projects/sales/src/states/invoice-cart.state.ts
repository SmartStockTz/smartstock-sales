import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SecurityUtil } from "smartstock-core";
import { InvoiceItemModel } from "../models/invoice-item.model";
import { InvoiceCartService } from "../services/invoice-cart.service";
import { CustomerModel } from "../models/customer.model";
import { OrderService } from "../public-api";
import { UserModel } from "bfast/dist/lib/models/UserModel";

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
    private readonly orderService: OrderService,
    private readonly snack: MatSnackBar
  ) {}

  private message(reason) {
    this.snack.open(
      reason && reason.message ? reason.message : reason.toString(),
      "",
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

  async saveProfoma(user: UserModel): Promise<any>{
    return this.orderService.saveOrder(
      SecurityUtil.generateUUID(),
      this.carts.value.map(x=>{
        x.stock.retailPrice = x.amount;
        x.stock.wholesalePrice = x.amount;
        return {
          quantity: x.quantity,
          product: x.stock as any
        }
      }),
      'profoma',
      this.selectedCustomer.value,
      user
    ).then(()=>{
      this.dispose();
      return;
    });
  }

  dispose() {
    this?.carts.next([]);
    this?.cartTotal.next(0);
    this?.cartTotalItems.next(0);
    this?.selectedCustomer.next(null);
  }
}
