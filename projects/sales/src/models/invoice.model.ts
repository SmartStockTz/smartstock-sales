import {InvoiceItemModel} from './invoice-item.model';

export type InvoiceModel = {
  id: string;
  date: any;
  dueDate: string;
  channel: 'online' | 'credit';
  items?: InvoiceItemModel[];
  amount: number;
  customer: {
    id: string;
    mobile: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  sponsor: {
    name: string;
    id: string;
  };
  generatedBy: string;
  sellerObject: {
    firstname: string;
    lastname: string;
  };
  status: 'paid' | 'unpaid';
  refund: {
    amount: number;
    quantity: number;
  }
  payment: {
    [date: string]: number
  };
  // invoice number
  batchId: string;
  updatedAt: string;
  createdAt: string;
  notes?: string
};
