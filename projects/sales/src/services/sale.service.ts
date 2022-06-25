import { Injectable } from "@angular/core";
import { SaleWorker } from "../workers/sale.worker";
import { getDaasAddress, SecurityUtil, UserService } from "smartstock-core";
import { wrap } from "comlink";
import { StockModel } from "../models/stock.model";
import { SalesModel } from "../models/sale.model";
import { cache, database, functions } from "bfast";
import { sha1 } from "crypto-hash";
import { updateStockInLocalSyncs } from "../utils/stock.util";
import { SocketController } from "bfast/dist/lib/controllers/socket.controller";

@Injectable({
  providedIn: "root"
})
export class SaleService {
  private changes: SocketController;

  constructor(private readonly userService: UserService) {}

  private static async withWorker(
    fn: (saleWorker: SaleWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL("../workers/sale.worker", import.meta.url)
      );
      const SW = (wrap(nativeWorker) as unknown) as any;
      const stWorker = await new SW();
      return await fn(stWorker);
    } finally {
      if (nativeWorker) {
        nativeWorker.terminate();
      }
    }
  }

  async products(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    return cache({ database: shop.projectId, collection: "stocks" })
      .getAll()
      .then((stocks) => {
        if (Array.isArray(stocks) && stocks.length > 0) {
          return stocks;
        }
        return this.getProductsRemote().then((rP) => {
          cache({ database: shop.projectId, collection: "stocks" })
            .setBulk(
              rP.map((x) => x.id),
              rP
            )
            .catch(console.log);
          return rP;
        });
      });
  }

  async saveSale(sales: SalesModel[]) {
    const shop = await this.userService.getCurrentShop();
    const cartId = SecurityUtil.generateUUID();
    for (const sale of sales) {
      sale.id = SecurityUtil.generateUUID();
      sale.cartId = cartId;
      sale.createdAt = new Date().toISOString();
      sale.batch = SecurityUtil.generateUUID();
      await cache().addSyncs({
        applicationId: shop.applicationId,
        projectId: shop.projectId,
        payload: sale,
        action: "create",
        databaseURL: getDaasAddress(shop),
        tree: "sales"
      });
      if (sale.stock.stockable === true) {
        await cache().addSyncs({
          applicationId: shop.applicationId,
          projectId: shop.projectId,
          payload: {
            id: sale.stock.id,
            [`quantity.${await sha1(JSON.stringify(sale))}`]: {
              q: -sale.quantity,
              s: "sale",
              d: new Date().toISOString()
            }
          },
          tree: "stocks",
          action: "update",
          databaseURL: getDaasAddress(shop)
        });
        await updateStockInLocalSyncs(sale, shop);
      }
    }
  }

  private async remoteAllProducts(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).table("stocks").getAll();
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    const products = await this.remoteAllProducts();
    return SaleService.withWorker((saleWorker) => {
      return saleWorker.filterSaleableProducts(products, shop);
    });
  }

  async search(query: string): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    const products: StockModel[] = await this.products();
    return SaleService.withWorker((saleWorker) => {
      return saleWorker.search(products, query, shop);
    });
  }

  async listeningStocksStop(): Promise<void> {
    if (this.changes && this.changes.close) {
      this.changes.close();
    }
  }

  async listeningStocks(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    this.changes = functions(shop.projectId).event(
      "/daas-changes",
      () => {
        console.log("connected on products changes");
        this.changes.emit({
          auth: {
            masterKey: shop.masterKey
          },
          body: {
            projectId: shop.projectId,
            applicationId: shop.applicationId,
            pipeline: [],
            domain: "stocks"
          }
        });
      },
      () => console.log("disconnected on products changes")
    );
    this.changes.listener(async (response) => {
      // console.log(response);
      const stockCache = cache({
        database: shop.projectId,
        collection: "stocks"
      });
      if (response && response.body && response.body.change) {
        switch (response.body.change.name) {
          case "create":
            const data = response.body.change.snapshot;
            await stockCache.set(data.id, data);
            return;
          case "update":
            let updateData = response.body.change.snapshot;
            const oldData = await stockCache.get(updateData.id);
            updateData = Object.assign(
              typeof oldData === "object" ? oldData : {},
              updateData
            );
            await stockCache.set(updateData.id, updateData);
            return;
          case "delete":
            const deletedData = response.body.change.snapshot;
            await stockCache.remove(deletedData.id);
            return;
        }
      }
    });
  }
}
