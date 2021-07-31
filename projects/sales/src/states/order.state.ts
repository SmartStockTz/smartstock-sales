import {Injectable} from '@angular/core';
import {OrderService} from '../services/order.service';
import {BehaviorSubject} from 'rxjs';
import {OrderModel} from '../models/order.model';
import {LogService, MessageService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'any'
})
export class OrderState {

  orders: BehaviorSubject<OrderModel[]> = new BehaviorSubject<OrderModel[]>([]);
  orderFilterKeyword: BehaviorSubject<string> = new BehaviorSubject<string>('');
  getOrderFlag: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  markAsCompleteFlag: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private readonly orderService: OrderService,
              private readonly logger: LogService,
              private readonly messageService: MessageService) {
  }

  getOrder(): void {
    this.getOrderFlag.next(true);
    this.orderService.getOrders().then(value => {
      if (value && Array.isArray(value)) {
        this.orders.value.push(...value);
        this.orders.next(this.orders.value);
      }
    }).catch(_ => {
      this.logger.i(_);
      this.messageService.showMobileInfoMessage('Fails to fetch orders', 2000, 'bottom');
    }).finally(() => {
      this.getOrderFlag.next(false);
    });
  }

  markAsComplete(order: OrderModel): void {
    this.markAsCompleteFlag.next(true);
    this.orderService.markAsCompleted(order).then(_ => {
      this.orders.value.map(x => {
        if (x.id === order.id) {
          x.status = 'COMPLETED';
          x.paid = true;
        }
        return x;
      });
      this.messageService.showMobileInfoMessage('Order updated', 2000, 'bottom');
    }).catch(reason => {
      this.logger.i(reason);
      this.messageService.showMobileInfoMessage(reason && reason.message ? reason.message : reason, 2000, 'bottom');
    }).finally(() => {
      this.markAsCompleteFlag.next(false);
    });
  }

  async markOrderAsCancelled(order: OrderModel): Promise<any> {
    return this.orderService.markOrderAsCancelled(order);
  }

  async markAsProcessed(order: OrderModel): Promise<any> {
    return this.orderService.markAsProcessed(order);
  }

}
