import { Injectable } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiUtilsService {

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning',
    position: 'middle' | 'bottom' | 'middle',
    duration: number
  ): Promise <void> {
    const toast =  await this.toastCtrl.create({
      message,
      color,
      duration,
      position
    });

    toast.present();
  }

  async showLoading(message: string, duration:number): Promise<HTMLIonLoadingElement>{
    const loading = await this.loadingCtrl.create({message, duration})

    await loading.present();

    return loading;
  }

  async showLoadingPrefab(): Promise<HTMLIonLoadingElement>{
    const loading = await this.loadingCtrl.create({message: 'Cargando...'});

    await loading.present();

    return loading;
  }

  async showAlert(header: string, message: string): Promise<void>{
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: true,
      buttons: ['Aceptar']
    });

    alert.present();
  }
}
