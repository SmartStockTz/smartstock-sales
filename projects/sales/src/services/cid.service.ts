import {Injectable} from '@angular/core';
import {IpfsService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'root'
})
export class CidService {
  constructor() {
  }

  async toDatas(cids: string[]) {
    return await Promise.all(
      cids.map(async c => {
        return IpfsService.getDataFromCid(c);
        // console.log(dt);
        // dt.id = dt._id;
        // delete dt._id;
        // dt.createdAt = dt._created_at;
        // delete dt._created_at;
        // dt.updatedAt = dt._updated_at;
        // delete dt._updated_at;
        // return dt;
      })
    ) as any;
  }
}
