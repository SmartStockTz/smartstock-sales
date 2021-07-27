import {StockModel} from './stock.model';
import {CustomerModel} from './customer.model';

export interface SalesModel {
  soldBy: {
    username: string;
  };
  id?: string;
  _id?: string;
  idTra?: string;
  createdAt?: any;
  updatedAt?: any;
  updatedBy?: any;
  date: any;
  timer: any;
  product: string;
  category: string;
  unit: string;
  quantity: number;
  amount: number;
  customer: string;
  cartId?: string;
  discount: number;
  user: string;
  sellerObject: {
    username: string;
    lastname: string;
    firstname: string;
    email: string;
  };
  channel: 'whole' | 'retail' | 'invoice' | 'online' | string;
  stock: StockModel;
  batch?: string;
  stockId: string;
  customerObject: {
    firstName: string;
    displayName: string;
    lastName: string;
    mobile: string;
    email: string;
  };
}
