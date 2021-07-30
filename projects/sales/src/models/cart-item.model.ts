import {StockModel} from './stock.model';

export interface CartItemModel {
  product: StockModel;
  quantity: number;
}
