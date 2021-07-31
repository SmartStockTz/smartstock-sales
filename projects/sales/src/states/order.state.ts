import {Injectable} from '@angular/core';
import {OrderService} from '../services/order.service';
import {BehaviorSubject} from 'rxjs';
import {OrderModel} from '../models/order.model';
import {LogService} from '@smartstocktz/core-libs';
import {MatSnackBar} from '@angular/material/snack-bar';

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
              private readonly snack: MatSnackBar) {
  }

  getOrders(): void {
    this.getOrderFlag.next(true);
    this.orderService.getOrders().then(value => {
      if (value && Array.isArray(value)) {
        // this.orders.value.push(...value);
        this.orders.next(value);
      }
    }).catch(_ => {
      this.logger.i(_);
      this.message('Fails to fetch orders');
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
      this.message('Order updated');
    }).catch(reason => {
      this.logger.i(reason);
      this.message(reason && reason.message ? reason.message : reason);
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

  getOrdersRemote() {
    this.getOrderFlag.next(true);
    this.orderService.getRemoteOrders().then(value => {
      if (value && Array.isArray(value)) {
        // this.orders.value.push(...value);
        this.orders.next(value);
      }
    }).catch(_ => {
      this.logger.i(_);
      this.message('Fails to fetch orders');
    }).finally(() => {
      this.getOrderFlag.next(false);
    });
  }

  private message(reason: any) {
    this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
      duration: 2000
    });
  }

  query(query: string) {
    this.getOrderFlag.next(true);
    this.orderService.search(query).then(value => {
      if (value && Array.isArray(value)) {
        this.orders.next(value);
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.getOrderFlag.next(false);
    });
  }

  deleteOrder(order: OrderModel) {
    this.getOrderFlag.next(true);
    this.message('Deleting...');
    this.orderService.deleteOrder(order).then(v => {
      this.orders.next(this.orders.value.filter(x => x.id !== order.id));
      this.message(`Order deleted permanent`);
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.getOrderFlag.next(false);
    });
  }
}
