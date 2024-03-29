import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'muda'
})
export class MudaPipe implements PipeTransform {


  constructor() {
  }

  transform(value: any, ...args: any[]): string {
    if (value) {
      return moment(value).format('HH:mm');
    } else {
      return 'N/A';
    }
  }

}
