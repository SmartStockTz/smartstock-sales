import {StockModel} from './stock.model';

export interface SalesModel {
  isReturned?: boolean;
  soldBy?: { username: string };
  id?: string;
  idTra?: string;
  date?: any;
  product?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  amount?: number;
  customer?: string;
  cartId?: string; // for retrieve sold items per cart/order
  discount?: number;
  user?: string;
  sellerObject?: any;
  timer: string;
  channel?: string;
  stock?: StockModel;
  batch?: string; // for offline sync
  stockId: string;
  creditor?: any;
  paid?: boolean;
}
