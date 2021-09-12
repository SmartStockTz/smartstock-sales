import {Injectable} from '@angular/core';
import {SalesModel} from '../models/sale.model';
import {database} from 'bfast';
import moment from 'moment';
import {UserService} from '@smartstocktz/core-libs';
import {CidService} from './cid.service';

@Injectable({
  providedIn: 'root'
})

export class RefundService {

  constructor(private readonly userService: UserService,
              private readonly cidService: CidService) {
  }

  async getSales(date: Date): Promise<SalesModel[]> {
    const shop = await this.userService.getCurrentShop();
    const cids: string[] = await database(shop.projectId).table('sales')
      .query()
      .equalTo('date', moment(date).format('YYYY-MM-DD'))
      .cids(true)
      .find();
    const sales: SalesModel[] = await this.cidService.toDatas(cids);
    return sales.sort((a, b) => {
      if (a?.timer > b?.timer) {
        return -1;
      }
      if (a?.timer < b?.timer) {
        return 1;
      }
      return 0;
    });
  }

  async create(value: { amount: number; quantity: number }, sale: SalesModel): Promise<SalesModel> {
    const shop = await this.userService.getCurrentShop();
    const user = await this.userService.currentUser();
    // @ts-ignore
    value.user = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username
    };
    return database(shop.projectId).table('sales')
      .query()
      .byId(sale.id)
      .updateBuilder()
      .doc({refund: value})
      .update();
  }
}

