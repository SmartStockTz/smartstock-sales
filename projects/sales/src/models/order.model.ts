import {CartItemModel} from './cart-item.model';
import {CustomerModel} from './customer.model';

export interface OrderModel {
  paid?: boolean;
  id?: string;
  createdAt?: any;
  updatedAt?: any;
  total?: number;
  date?: any;
  orderRef?: string;
  channel?: string;
  items?: CartItemModel[];
  customer?: CustomerModel;
  shipping?: {
    mobile?: string;
    location?: any;
  };
  placedBy?: {
    username: string;
    firstname: string;
    lastname: string
  };
  status?: 'PROCESSED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' ;
}
