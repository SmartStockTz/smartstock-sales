import {StockModel} from './stock.model';

export interface StockSyncModel {
  action: 'upsert' | 'delete';
  product: StockModel;
}
