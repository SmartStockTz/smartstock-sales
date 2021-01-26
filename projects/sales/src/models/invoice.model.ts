import {StockModel} from './stock.model';

export interface InvoiceModel{
  id?: string;
  date?: any;
  items?: any[];
  quantity?: number;
  amount?: number;
  customer?: string;
  discount?: number;
  sellerObject?: any;
  returns?: [number];
  dueDate?: any;
  batchId?: string;
}
