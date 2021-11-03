import {expose} from 'comlink';
import {CartItemModel} from '../models/cart-item.model';
import {CartModel} from '../models/cart.model';
import {SalesModel} from '../models/sale.model';
import {LibUserModel, SecurityUtil, toSqlDate} from '@smartstocktz/core-libs';
import moment from 'moment';
import {CustomerModel} from '../models/customer.model';
import {StockModel} from '../models/stock.model';

export class CartWorker {

  private static getCartItemDiscount(data: { totalDiscount: number, totalItems: number }): number {
    return (data.totalDiscount / data.totalItems);
  }

  private static getQuantityForPrint(channel: string, cart: CartModel): number | string {
    switch (channel) {
      case 'retail':
        return cart.quantity;
      case 'whole':
        return cart.quantity * cart.stock.wholesaleQuantity; // `${cart.quantity} x ${cart.stock.wholesaleQuantity}`;
      case 'credit':
        return cart.quantity;
      default:
        return cart.quantity;
    }
  }

  private static getQuantity(channel: string, cart: CartItemModel): number {
    switch (channel) {
      case 'retail':
        return cart.quantity;
      case 'whole':
        return cart.quantity * cart.product.wholesaleQuantity;
      case 'credit':
        return cart.quantity;
      default:
        return cart.quantity;
    }
  }

  private static getPrice(channel: string, cart: CartModel): number {
    switch (channel) {
      case 'retail':
        return cart.stock.retailPrice;
      case 'whole':
        return cart.stock.wholesalePrice;
      case 'credit':
        return cart.stock.creditPrice;
      default:
        return cart.stock.retailPrice;
    }
  }

  private static getCartItemAmount(cart: CartItemModel, channel: string, discount: number): number {
    switch (channel) {
      case 'retail':
        return (cart.quantity * cart.product.retailPrice) - discount;
      case 'whole':
        return (cart.quantity * cart.product.wholesalePrice) - discount;
      case 'credit':
        return (cart.quantity * cart.product.creditPrice) - discount;
      default:
        return (cart.quantity * cart.product.retailPrice) - discount;
    }
  }

  async findTotal(carts: CartItemModel[], channel: string, discount: any): Promise<number> {
    return carts.map<number>(value => {
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
  }

  async addToCart(carts: CartItemModel[], cart: CartItemModel): Promise<CartItemModel[]> {
    let update = false;
    carts.map(x => {
      if (x.product.id === cart.product.id) {
        x.quantity += cart.quantity;
        update = true;
      }
      return x;
    });
    if (update === false) {
      carts.push(cart);
    }
    return carts;
  }

  async getSalesBatch(
    carts: CartItemModel[],
    channel: string,
    discount: number,
    customer: CustomerModel,
    user: LibUserModel
  ): Promise<SalesModel[]> {
    const stringDate = toSqlDate(new Date());
    const idTra = 'n';
    return carts.map<SalesModel>(value => {
      return {
        id: SecurityUtil.generateUUID(),
        amount: CartWorker.getCartItemAmount(value, channel, discount),
        discount: CartWorker.getCartItemDiscount(
          {totalItems: carts.length, totalDiscount: discount}
        ),
        quantity: CartWorker.getQuantity(channel, value),
        product: value.product.product,
        category: value.product.category,
        unit: value.product.unit,
        channel,
        date: stringDate,
        idTra,
        customer: user.id === 'smartstock-hq' ? customer?.payRef : customer?.displayName,
        customerObject: {
          phone: 'SYSTEM',
          email: customer?.email,
          displayName: customer?.displayName,
        },
        soldBy: {
          username: user?.username
        },
        timer: moment(new Date()).format('YYYY-MM-DDTHH:mm'),
        user: user?.id,
        sellerObject: {
          username: user?.username,
          email: user?.email,
          firstname: user?.firstname,
          lastname: user?.lastname
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stock: {
          id: value.product.id,
          product: value.product.product,
          stockable: value.product.stockable,
          category: value.product.category,
          unit: value.product.unit,
          creditPrice: value.product.creditPrice,
          quantity: this.getStockQuantity(value.product),
          expire: value.product.expire,
          retailPrice: value.product.retailPrice,
          purchase: value.product.purchase,
          type: value.product.type,
          wholesalePrice: value.product.wholesalePrice,
          wholesaleQuantity: value.product.wholesaleQuantity,
          supplier: value.product.supplier
        },
        stockId: value.product.id
      };
    });
  }

  getStockQuantity(stock: StockModel): number {
    let qty: any = 0;
    if (stock && isNaN(Number(stock.quantity)) && typeof stock.quantity === 'object') {
      // @ts-ignore
      qty = Object.values(stock.quantity).reduce((a, b) => a + b.q, 0);
    }
    if (stock && !isNaN(Number(stock.quantity)) && typeof stock.quantity === 'number') {
      qty = stock.quantity as number;
    }
    return qty as number;
  }

  async cartItemsToPrinterData(carts: CartModel[], customer: CustomerModel, channel: string,
                               discount: number, printOnly: boolean): Promise<string> {
    let data = printOnly === true ? 'NOTE: THIS IS PRINT ONLY RECEIPT CAN NOT BE USED AS SAKE RECEIPT' : '';
    data = data.concat('-------------------------------\n');
    data = data.concat(new Date().toDateString() + '\n');
    if (customer && customer.displayName) {
      data = data.concat('\n-------------------------------\nCUSTOMER : ' + customer?.displayName + '\n');
    }
    let totalBill = 0;
    carts.forEach((cart, index) => {
      totalBill += (cart.amount as number);
      data = data.concat(
        `------------------------------------
ITEM : ${cart.product}
QUANTITY : ${CartWorker.getQuantityForPrint(channel, cart)}  ${cart.stock.unit}
SUB TOTAL : ${cart.amount}
        \n`
      );
    });
    data = data.concat(
      '--------------------------------\n' +
      'TOTAL AMOUNT : ' + totalBill +
      '\nDISCOUNT : ' + (discount ? discount.toString() : '0') +
      '\nNET AMOUNT : ' + (totalBill - (discount ? discount : 0)) +
      '\n--------------------------------\n'
    );
    return data;
  }

  async cartItemsToSaleItems(carts: CartItemModel[], discount: number, channel: string): Promise<CartModel[]> {
    return carts.map<CartModel>(value => {
      return {
        amount: CartWorker.getCartItemAmount(value, channel, 0),
        product: value.product.product,
        quantity: value.quantity,
        stock: value.product,
        discount: (isNaN(discount) ? 0 : discount) / carts.length
      };
    });
  }
}

expose(CartWorker);
