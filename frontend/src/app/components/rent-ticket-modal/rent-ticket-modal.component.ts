import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {  JSPrintManager, InstalledPrinter, ClientPrintJob } from 'jsprintmanager';
import moment from 'moment';

@Component({
  selector: 'app-rent-ticket-modal',
  templateUrl: './rent-ticket-modal.component.html',
  styleUrls: ['./rent-ticket-modal.component.scss'],
})
export class RentTicketModalComponent implements OnInit {

@Input() ticket: any;
@Input() total: any;
@Input() date: any;
@Input() payment:any;
@Input() product:any;
@Input() deposit:any;

  constructor(
    private modalCtrl: ModalController
    ) { }

  ngOnInit() {
  }

  async print() {
    JSPrintManager.auto_reconnect = true;
    await JSPrintManager.start()

    // Create a ClientPrintJob
    var cpj = new ClientPrintJob();
    // Set Printer type (Refer to the help, there many of them!)
    cpj.clientPrinter = new InstalledPrinter('ZJ-58 11.3.0.1 U');

    // Resto del código de impresión
    var esc = '\x1B'; //ESC byte in hex notation
    var newLine = '\x0A'; //LF byte in hex notation

    var cmds = esc + "@"; //Initializes the printer (ESC @)
    cmds += esc + '!' + '\x18'; //Emphasized + Double-height + Double-width mode selected (ESC ! (8 + 16 + 32)) 56 dec => 38 hex
    cmds += 'Disfraces Matatena'; //text to print
    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
    cmds += newLine + newLine;
    cmds += 'No. de renta: '+ this.ticket;
    cmds += newLine;
    cmds += moment(this.date).locale('es').format('LLL');
    cmds += newLine+newLine;
    cmds += 'ID'+'     ';
    cmds += 'Producto';
    cmds += '   '+'Precio';
    cmds += newLine;
    cmds += parseInt(this.product.code)+'  -  ';
    cmds += JSON.stringify(this.product.name).substring(1,5);
    cmds += '  -  $'+JSON.stringify(this.product.price);
    cmds += newLine;
    cmds += newLine + newLine;
    cmds += 'Este ticket representa un servicio, NO una venta';
    cmds += newLine;
    cmds += 'Metodo de pago: '+ this.payment;
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    cmds += 'TOTAL: $'+ this.total;
    cmds += esc + '!' + '\x00'; //Character font A selected (ESC ! 0)
    cmds += newLine;
    cmds += esc + '!' + '\x16'; //Emphasized + Double-height mode selected (ESC ! (16 + 8)) 24 dec => 18 hex
    cmds += 'DEPOSITO: $'+ this.deposit;
    cmds += esc + '!' + '\x00'; 
    cmds += newLine + newLine;
    cmds += newLine+newLine+newLine+newLine;

    cpj.printerCommands = cmds;

    // Send print job to printer!
    cpj.sendToClient()
}

  onCancel(){
    this.modalCtrl.dismiss();
  }

}
