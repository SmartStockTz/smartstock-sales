import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CartItemModel} from '../models/cart-item.model';
import {CartService} from '../services/cart.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PrintService} from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import {SalesState} from './sales.state';
import {OrderService} from '../services/order.service';
import {OrderModel} from '../models/order.model';


@Injectable({
  providedIn: 'root'
})
export class CartState {
  carts = new BehaviorSubject<CartItemModel[]>([]);
  cartTotal = new BehaviorSubject(0);
  cartTotalItems = new BehaviorSubject(0);
  checkoutProgress = new BehaviorSubject(false);
  selectedCustomer = new BehaviorSubject<CustomerModel>(null);
  cartOrder = new BehaviorSubject<OrderModel>(null);

  constructor(private readonly cartService: CartService,
              private readonly printService: PrintService,
              private readonly orderService: OrderService,
              private readonly salesState: SalesState,
              private readonly snack: MatSnackBar) {
  }

  private message(reason) {
    console.log(reason);
    this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
      duration: 2000
    });
  }

  addToCart(cart: CartItemModel): void {
    this.cartService.addToCart(this.carts.value, cart).then(value => {
      this.carts.next(value);
    }).catch(reason => {
      this.message(reason);
    });
  }

  findTotal(channel: string, discount: any = 0) {
    this.cartService.findTotal(this.carts.value, channel, discount).then(value => {
      this.cartTotal.next(value);
    }).catch(reason => {
      this.message(reason);
    });
  }

  totalItems(): void {
    this.cartTotalItems.next(
      this.carts.value.map(cartItem => cartItem.quantity).reduce((a, b) => a + b, 0)
    );
  }

  incrementCartItemQuantity(indexOfProductInCart: number): void {
    this.carts.value[indexOfProductInCart].quantity = this.carts.value[indexOfProductInCart].quantity + 1;
    this.carts.next(this.carts.value);
  }

  decrementCartItemQuantity(indexOfProductInCart: number): void {
    if (this.carts.value[indexOfProductInCart].quantity > 1) {
      this.carts.value[indexOfProductInCart].quantity = this.carts.value[indexOfProductInCart].quantity - 1;
      this.carts.next(this.carts.value);
    }
  }

  removeItemFromCart(indexOfProductInCart: number): void {
    this.carts.value.splice(indexOfProductInCart, 1);
    this.carts.next(this.carts.value);
  }

  clearCart(): void {
    this.carts.next([]);
  }

  async checkout(channel: string, discount: number, user: any): Promise<any> {
    this.checkoutProgress.next(true);
    this.cartService.checkout(
      this.carts.value,
      this.selectedCustomer.value,
      channel,
      discount,
      user
    ).then(_12 => {
      if (this.cartOrder.value?.id) {
        return this.orderService.deleteOrder(this.cartOrder.value);
      } else {
        return _12;
      }
    }).then(_ => {
      this.cartOrder.next(null);
      this.message('Done save sales');
    }).catch(reason => {
      this.message(reason);
      throw reason;
    }).finally(() => {
      this.selectedCustomer.next(null);
      this.checkoutProgress.next(false);
    });
  }

  dispose() {
    this.cartService.stopWorker();
    if (this.cartOrder.value?.id) {
      this.carts.next([]);
      this.cartOrder.next(null);
    }
  }

  saveOrder(channel: string, user: any): Promise<any> {
    this.checkoutProgress.next(true);
    return this.orderService.saveOrder(
      this.cartOrder.value?.id,
      this.carts.value,
      channel,
      this.selectedCustomer.value,
      user
    ).then(_ => {
      this.cartOrder.next(null);
      this.message('Done save order');
    }).catch(reason => {
      // console.log(reason);
      this.message(reason);
      throw reason;
    }).finally(() => {
      this.checkoutProgress.next(false);
    });
  }

  async printOnly(channel: string, discount: number): Promise<any> {
    this.checkoutProgress.next(true);
    return this.cartService.printCart(
      this.carts.value,
      channel,
      discount,
      this.selectedCustomer.value,
      true
    ).then(_ => {
      this.message('Done print cart');
    }).catch(reason => {
      this.message(reason);
      throw reason;
    }).finally(() => {
      // this.selectedCustomer.next(null);
      this.checkoutProgress.next(false);
    });
  }
}
