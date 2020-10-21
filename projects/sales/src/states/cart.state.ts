import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CartModel} from '../models/cart.model';
import {StockModel} from '../models/stock.model';

@Injectable({
  providedIn: 'any'
})
export class CartState {
  carts: BehaviorSubject<{ quantity: number, product: StockModel }[]>
    = new BehaviorSubject<{ quantity: number, product: StockModel }[]>([]);

  addToCart(cart: { product: StockModel, quantity: number }): void {
    const updateItem = this.carts.value.find(x => x.product.id === cart.product.id);
    if (updateItem != null) {
      const index = this.carts.value.indexOf(updateItem);
      this.carts.value[index].quantity = this.carts.value[index].quantity + cart.quantity;
    } else {
      this.carts.value.push(cart);
    }
    this.carts.next(this.carts.value);
  }

  removeToCart(cartModel: CartModel): void {

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
