import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';

//Services
import { UiUtilsService } from './ui-utils.service';

const EXCEL_FILE_FORMAT =
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Injectable({
  providedIn: 'root'
})
export class XlsxService {

  constructor(
    private uiUtils: UiUtilsService,
    private platform: Platform
  ) { }

  // Needed to read excel file for both web and mobile platforms
  getFileReader() {
    const fileReader = new FileReader();
    const zoneOriginalInstance = (fileReader as any)[
      '__zone_symbol__originalInstance'
    ];
    return zoneOriginalInstance || fileReader;
  }

  async readFileAsync<T>(excelFile, headers): Promise<Array<T>> | null {
    // Validate file
    if (excelFile.type !== EXCEL_FILE_FORMAT) {
      await this.uiUtils.showToast(
        'El tipo de archivo no es válido',
        'danger',
        'middle',
        1500
      );
      return null;
    }

    return new Promise((res) => {
      let fileReader = this.getFileReader();

      fileReader.onloadend = (e) => {
        let arrayBuffer = fileReader.result;
        let data = new Uint8Array(arrayBuffer);
        let arr = new Array();
        for (let i = 0; i != data.length; ++i)
          arr[i] = String.fromCharCode(data[i]);
        let bstr = arr.join('');
        let workbook = XLSX.read(bstr, { type: 'binary' });
        let first_sheet_name = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[first_sheet_name];
        let rows = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: ''}) as T[];
        let keys = Object.keys(rows[0]);
        if(!(JSON.stringify(keys) === JSON.stringify(headers))){
          this.uiUtils.showToast(
            'El formato de archivo no es válido',
            'danger',
            'middle',
            1500
          );
          return null;
        }
        res(rows);
      };

      fileReader.readAsArrayBuffer(excelFile);
    });
  }

  async downloadFile(workbook: any, name: string){
    if(this.platform.is('capacitor')){
      await Filesystem.writeFile({
        path: `maclean/${name}`,
        data: XLSX.write(workbook, {type: 'base64'}),
        directory: Directory.Documents,
        recursive: true
      })
    }else{
      XLSX.writeFile(workbook, name);
    }

    this.uiUtils.showToast('Archivo guardado correctamente', 'success', 'middle', 1500);
  }

  async generateFileTemplate(headers: any[], modalName: string){
    const worksheet = XLSX.utils.aoa_to_sheet([[...headers]]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");

    // XLSX.writeFile(workbook, `Plantilla_${modalName}.xlsx`);

    const name = `Plantilla_${modalName}.xlsx`
    this.downloadFile(workbook, name);
  }
}
