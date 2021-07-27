import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MessageService} from '@smartstocktz/core-libs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'any'
})

export class TransferState {
  constructor(
    private readonly router: Router,
    private readonly messageService: MessageService) {
  }

  totalTransfersItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  transfers: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  isFetchTransfers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSaveTransfers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  countAll(): void {

  }

  fetch(size = 20, skip = 0): void {

  }

  save(transfer: any): void {

  }
}
