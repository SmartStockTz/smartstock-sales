import {OrderModel} from './order.model';

export interface OrderSyncModel{
  action: 'delete' | 'upsert';
  order: OrderModel;
}
