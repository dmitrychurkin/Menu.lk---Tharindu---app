import { Injectable } from '@angular/core';
import { LoadingController, Loading, LoadingOptions, AlertController } from 'ionic-angular';

 
/*
  Generated class for the PreloaderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PreloaderProvider {
  private get cfgOptsDefault(): LoadingOptions {
    return {
      content: 'Please wait...',
      dismissOnPageChange: true
    };
  }
  constructor(
    private loadUXCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    // console.log('Hello PreloaderProvider Provider');
  }
  private _getPreloader(cfg= this.cfgOptsDefault): Loading {
    return this.loadUXCtrl.create(cfg);
  }
  private _showAlert(jobRetry?: (...args: Array<any>) => any) {
    this.alertCtrl.create({
      enableBackdropDismiss: false,
      title: 'Error!',
      message: 'Error occured while loading resource, please check internet connection.',
      buttons: [
        {
          text: 'Retry',
          handler: () => jobRetry(),
          role: 'retry'
        }
      ]
    }).present();
  }
  startLoad(job: (...a: Array<any>) => Promise<any>, cfg?: LoadingOptions, jobArgs?: Array<any>) { 
    let loader = this._getPreloader(cfg);
    loader.present();

    return job(...jobArgs)
            .then((jobResult: any) => {
              loader.dismissAll();
              return jobResult;
            })
            .catch((err: any) => {
              this._showAlert(() => this.startLoad(job, cfg, jobArgs));
            });
  }
}
