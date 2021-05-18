import {SalesModel} from './sale.model';

export interface ReturnsModel extends SalesModel {
  returnDate: any;
  returnBy: any;
}
