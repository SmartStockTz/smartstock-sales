import {StockModel} from './stock.model';

export interface InvoiceModel{
  id?: string;
  date?: any;
  items?: any[];
  quantity?: number;
  amount?: number;
  customer?: any;
  sellerObject?: any;
  returns?: [any];
  dueDate?: any;
  batchId?: string;
  updatedAt?: string;
}
