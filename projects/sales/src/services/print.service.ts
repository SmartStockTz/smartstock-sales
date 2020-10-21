import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SettingsService} from '../user-modules/settings.service';
import {PrinterModel} from '../models/printer.model';
import { ConfigsService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  url: string;

  constructor(private readonly settings: SettingsService,
              private readonly httpClient: HttpClient) {
  }

  private async printInMobile(printerModel: PrinterModel): Promise<string> {
    return 'done printing';
  }

  private async printInDesktop(printModel: PrinterModel): Promise<any> {
    this.url = `${ConfigsService.printerUrl}/print`;
    return this.httpClient.post(this.url, {
      data: printModel.data,
      id: printModel.id
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      responseType: 'text'
    }).toPromise();
  }

  async print(printModel: PrinterModel): Promise<any> {
    const cSettings = await this.settings.getSettings();
    let data = '';
    data = data.concat(cSettings.printerHeader + '\n');
    data = data.concat(printModel.data);
    data = data.concat(cSettings.printerFooter);

    printModel.data = data;

    if (!ConfigsService.production) {
      console.warn('print services disabled in dev mode');
      return;
    }

    // console.log(cSettings.saleWithoutPrinter);
    if (ConfigsService.android && !cSettings.saleWithoutPrinter) {
      return 'done printing';
    }

    if (ConfigsService.electron && !cSettings.saleWithoutPrinter) {
      return await this.printInDesktop(printModel);
    }

    if (ConfigsService.browser && !cSettings.saleWithoutPrinter) {
      return await this.printInDesktop(printModel);
    }

    return;
  }

}
