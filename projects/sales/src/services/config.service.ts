import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ConfigsService{
  static android = false;
  static smartstock = {
      databaseURL : '',
      functionsURL : ''
  }
  static printerUrl = ''
  static production = false
  static electron = false
  static browser = false 
  
}