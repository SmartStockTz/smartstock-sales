import { expose } from "comlink";
import { StockModel } from "../models/stock.model";

export class SaleWorker {
  constructor() {}

  async filterSaleableProducts(
    products: StockModel[],
    shop: any
  ): Promise<StockModel[]> {
    return products.filter((x) => x.saleable);
  }

  async search(
    stocks: StockModel[],
    query: string,
    shop: any
  ): Promise<StockModel[]> {
    return stocks.filter((x) => {
      return (
        x?.saleable === true &&
        x?.product?.toString()?.toLowerCase().includes(query?.toLowerCase())
      );
    });
  }
}

expose(SaleWorker);
