import { Injectable } from "@angular/core";
import { ToastController, ToastOptions } from "ionic-angular";

@Injectable()
export class ToastMessangerService {

  private get _defaultCfg(): ToastOptions {
    return {
      duration: 3000
    };
  }

  constructor(readonly toastCtrl: ToastController) {}

  showToast(config?: ToastOptions) {

    if (!config.message) return;
    
    return this.toastCtrl.create({ ...this._defaultCfg, ...config }).present();

  }
}