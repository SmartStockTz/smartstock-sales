import {Injectable} from '@angular/core';
import { StorageService } from '@smartstocktz/core-libs';
import {CustomerModel} from '../models/customer.model';
import { CreditorService } from '../services/creditor.services';

@Injectable({
  providedIn: 'root'
})
export class CreditorState {

  constructor(private readonly creditorService: CreditorService) {
    
  }

  getCreditors(): Promise<any[]> {
    return this.creditorService.getCreditors();
  }

  saveCreditor(customer: any): Promise<any> {
    return this.creditorService.saveCreditor(customer);
  }
}
