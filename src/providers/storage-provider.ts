import { Injectable } from "@angular/core";
import { ToastController } from "ionic-angular";
import { Storage } from "@ionic/storage";

@Injectable()
export class StorageProvider {

  errorMessage = (err?: any) => `${err || 'Error'} occured`;
  
  constructor(private _toastCtrl: ToastController,
              private _storage: Storage) {
  //test only 
      
    _storage.ready()
    .then(() => {
      console.log("Clean Storage");
      _storage.remove('ShoppingCart');
    });
  }

  get storage(): Promise<LocalForage> {
    return this._storage.ready();
  }
  getItem(key: string): Promise<any> {
    return this.storage
                .then(() =>{
                  return this._storage.get(key);
                })
                .catch(this._errorHandler.bind(this));
  }
  setItem(key: string, value: any): Promise<any> {
    return this.storage
                .then(() => {
                  return this._storage.set(key, value);
                })
                .catch(this._errorHandler.bind(this));
  }
  removeItem(key: string) {
    return this.storage
                .then(() => {
                  return this._storage.remove(key);
                })
                .catch(this._errorHandler.bind(this));
  }
  private _errorHandler(err: any) {
    let showToast = this._configToast(this.errorMessage());
    return showToast();
  }
  private _configToast(message: string, showCloseButton= false, duration= 3000) {
    let toast = this._toastCtrl.create({
      message, duration, showCloseButton
    });
    return () => toast.present();
  }
}