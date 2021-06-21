import {StockModel} from '../models/stock.model';

export abstract class StockServiceAdapter {
  abstract exportToExcel(): Promise<any>;

  abstract importStocks(stocks: StockModel[]): Promise<any>;

  abstract addStock(stock: StockModel, inUpdateMode:boolean): Promise<StockModel> ;

  abstract deleteAllStock(stocks: StockModel[], callback?: (value: any) => void): void;

  abstract deleteStock(stock: StockModel): Promise<any>;

  abstract getAllStock(): Promise<StockModel[]>;

  abstract deleteMany(stocksId: string[]): Promise<any>;
}
