import { Injectable } from "@angular/core";
import { ToastController, ToastOptions } from "ionic-angular";


@Injectable()
export class ToastMessangerService {

  private readonly _notificationPool = [];

  private get _defaultCfg(): ToastOptions {
    return {
      duration: 3000
    };
  }

  constructor(readonly toastCtrl: ToastController) {}

  showToast(config?: ToastOptions) {


    if (!config.message || this._notificationPool.includes(config.message)) {

      return Promise.resolve();

    }
  
    this._notificationPool.push(config.message);

    const toast = this.toastCtrl.create({ ...this._defaultCfg, ...config });
    toast.onDidDismiss(_ => 
      this._notificationPool.splice(this._notificationPool.indexOf(config.message), 1)
    );

    return toast.present();

  }
}