import {Injectable} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {SecurityUtil} from 'smartstock-core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  findTotalCartCost(cartItems: { quantity: number, product: StockModel }[], isWholeSale: boolean): number {
    let totalCost: number;
    if (isWholeSale) {
      const mapped = cartItems.map(
        (cart => cart.quantity * cart.product.wholesaleQuantity * this.findCartItemUnitPrice(cart, isWholeSale))
      );
      totalCost = mapped.reduce((a, b) => a + b, 0);
    } else {
      const mapped = cartItems.map((cart => cart.quantity * cart.product.retailPrice));
      totalCost = mapped.reduce((a, b) => a + b, 0);
    }
    return totalCost;
  }

  findCartItemUnitPrice(cart: { quantity: number, product: StockModel }, isWholeSale: boolean): number {
    if (isWholeSale) {
      return cart.product.wholesalePrice / cart.product.wholesaleQuantity;
    } else {
      return cart.product.retailPrice;
    }
  }

  findTotalCartItem(cartItems: { quantity: number, product: StockModel }[]): number {
    const mapped = cartItems.map(value => value.quantity);
    return mapped.reduce((a, b) => a + b, 0);
  }

  findCartItemAmount(cart: { quantity: number, product: StockModel }, isWholeSale: boolean): number {
    if (isWholeSale) {
      return this.findCartItemUnitPrice(cart, isWholeSale) * cart.quantity * cart.product.wholesaleQuantity;
    } else {
      return cart.quantity * cart.product.retailPrice;
    }
  }

  findCartItemQuantity(cart: { quantity: number, product: StockModel }, isWholeSale: boolean): number {
    if (isWholeSale) {
      return cart.quantity * cart.product.wholesaleQuantity;
    } else {
      return cart.quantity;
    }
  }
}

const propertyOr = (property, orFn) =>
  (data) =>
    typeof data === 'object' && data !== null && data !== undefined && data.hasOwnProperty(property)
      ? data[property]
      : orFn(data);
const compose = (...fns) =>
  (...args) =>
    fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];
export const getProductId = compose(
  x => x.replace(new RegExp('[^a-zA-Z0-9]', 'ig'), '_'),
  x => x.replace(new RegExp('\\s+', 'ig'), '_'),
  x => x.trim(),
  propertyOr('product', (_) => SecurityUtil.generateUUID())
);
