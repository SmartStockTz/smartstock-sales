import { Injectable } from "@angular/core";
import { IpfsService } from "smartstock-core";

@Injectable({
  providedIn: "root"
})
export class CidService {
  constructor() {}

  async toDatas(cids: string[]) {
    return (await Promise.all(
      cids.map(async (c) => {
        return IpfsService.getDataFromCid(c);
        // console.log(dt);
        // dt.id = dt._id;
        // delete dt._id;
        // dt.createdAt = dt._created_at;
        // delete dt._created_at;
        // dt.updatedAt = dt._updated_at;
        // delete dt._updated_at;
        // recordPayment dt;
      })
    )) as any;
  }
}
