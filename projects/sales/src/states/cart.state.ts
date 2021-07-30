import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CartItemModel} from '../models/cart-item.model';

@Injectable({
  providedIn: 'any'
})
export class CartState {
  carts = new BehaviorSubject<CartItemModel[]>([]);
  cartTotal = new BehaviorSubject(0);

  addToCart(cart: CartItemModel): void {
    let update = false;
    this.carts.value.map(x => {
      if (x.product.id === cart.product.id) {
        x.quantity += x.quantity + cart.quantity;
        update = true;
      }
      return x;
    });
    if (update === false) {
      this.carts.value.push(cart);
    }
    this.carts.next(this.carts.value);
  }

  findTotal(channel: 'retail' | 'whole' | 'credit', discount: any = 0) {
    const total = this.carts.value.map<number>(value => {
      let quantity;
      let price;
      if (channel === 'retail') {
        quantity = value.quantity;
        price = value.product.retailPrice;
      } else if (channel === 'whole') {
        quantity = value.quantity;
        price = value.product.wholesalePrice;
      } else if (channel === 'credit') {
        quantity = value.quantity;
        price = value.product.creditPrice;
      } else {
        quantity = value.quantity;
        price = value.product.retailPrice;
      }
      return quantity * price;
    }).reduce((a, b) => {
      return a + b;
    }, discount && !isNaN(discount) ? -Number(discount) : 0);
    this.cartTotal.next(total);
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
}
