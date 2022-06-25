import { Injectable } from "@angular/core";
import { database } from "bfast";
import { StockModel } from "../models/stock.model";
import { IpfsService, MessageService, UserService } from "smartstock-core";
import { BehaviorSubject } from "rxjs";
import { MatTableDataSource } from "@angular/material/table";
import { StockService } from "../services/stock.service";
import { SupplierModel } from "../models/supplier.model";

@Injectable({
  providedIn: "root"
})
export class StockState {
  stocks: MatTableDataSource<StockModel> = new MatTableDataSource<StockModel>(
    []
  );
  isFetchStocks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly userService: UserService,
    private readonly stockService: StockService,
    private readonly messageService: MessageService
  ) {}

  async deleteSupplier(id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId)
      .collection("suppliers")
      .query()
      .byId(id)
      .delete();
  }

  getStocks(): void {
    this.isFetchStocks.next(true);
    this.stockService
      .getAllStock()
      .then((remoteStocks) => {
        this.stocks.data = remoteStocks;
      })
      .catch((reason) => {
        this.messageService.showMobileInfoMessage(
          reason && reason.message ? reason.message : reason,
          2000,
          "bottom"
        );
      })
      .finally(() => {
        this.isFetchStocks.next(false);
      });
  }

  async getAllSupplier(): Promise<SupplierModel[]> {
    const shop = await this.userService.getCurrentShop();
    const cids = await database(shop.projectId)
      .collection<SupplierModel>("suppliers")
      .getAll<string>({
        cids: true
      });
    return (await Promise.all(
      cids.map((c) => {
        return IpfsService.getDataFromCid(c);
      })
    )) as any[];
  }

  getStocksFromRemote(): void {
    this.isFetchStocks.next(true);
    this.stockService
      .getAllStockRemote()
      .then(async (remoteStocks) => {
        this.stocks.data = remoteStocks;
      })
      .catch((reason) => {
        this.messageService.showMobileInfoMessage(
          reason && reason.message ? reason.message : reason,
          2000,
          "bottom"
        );
      })
      .finally(() => {
        this.isFetchStocks.next(false);
      });
  }

  async updateSupplier(value: {
    id: string;
    field: string;
    value: string;
  }): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const supplierId = value.id;
    const data = {};
    data[value.field] = value.value;
    delete value.id;
    const response = await database(shop.projectId)
      .collection("suppliers")
      .query()
      .byId(supplierId)
      .updateBuilder()
      .set(value.field, value.value)
      .update();
    response.id = supplierId;
    return response;
  }
}
