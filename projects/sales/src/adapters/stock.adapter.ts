import {StockModel} from '../models/stock.model';

export abstract class StockServiceAdapter {
  async abstract exportToExcel(): Promise<any>;

  async abstract importStocks(stocks: StockModel[]): Promise<any>;

  async abstract addStock(stock: StockModel, inUpdateMode:boolean): Promise<StockModel> ;

  abstract deleteAllStock(stocks: StockModel[], callback?: (value: any) => void): void;

  async abstract deleteStock(stock: StockModel): Promise<any>;

  async abstract getAllStock(): Promise<StockModel[]>;

  async abstract deleteMany(stocksId: string[]): Promise<any>;
}
