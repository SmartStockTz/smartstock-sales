import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class ProductState {
  flipped: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  constructor() {
  }
}
