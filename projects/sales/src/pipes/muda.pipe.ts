import {Pipe, PipeTransform} from '@angular/core';
import {UserService} from '@smartstocktz/core-libs';
import * as moment from 'moment';

@Pipe({
  name: 'muda'
})
export class MudaPipe implements PipeTransform {


  constructor(private readonly userService: UserService) {
  }

  transform(value: any, ...args: any[]): string {
    if (value) {
      return moment(value).format('HH:MM');
    } else {
      return 'N/A';
    }
  }

}
