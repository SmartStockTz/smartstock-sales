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
  
}