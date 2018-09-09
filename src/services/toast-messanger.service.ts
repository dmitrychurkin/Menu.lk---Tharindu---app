import { Injectable } from "@angular/core";
import { ToastController, ToastOptions } from "ionic-angular";


@Injectable()
export class ToastMessangerService {

  private _notificationPool = [];

  private get _defaultCfg(): ToastOptions {
    return {
      duration: 3000
    };
  }

  constructor(readonly toastCtrl: ToastController) {}

  showToast(config?: ToastOptions) {

    const offset = this._notificationPool.indexOf(config.message);
    
    if (!config.message || (this._notificationPool.length && offset >= 0)) return;
  
    this._notificationPool.push(config.message);

    const toast = this.toastCtrl.create({ ...this._defaultCfg, ...config });
    toast.onDidDismiss(_ => this._notificationPool.splice(offset, 1));

    return toast.present();

  }
}