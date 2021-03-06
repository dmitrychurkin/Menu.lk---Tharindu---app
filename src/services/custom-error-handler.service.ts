import { Injectable, ErrorHandler } from "@angular/core";
import { ToastMessangerService } from "./toast-messanger.service";
import { Platform } from "ionic-angular";


@Injectable()
export class AppLevelErrorHandler extends ErrorHandler {


  constructor(
    private readonly _platform: Platform,
    private readonly _toastMessService: ToastMessangerService) {

    super();
  }

  handleError(error?: Error) {
    
    /** 
     * Debugging stuff only 
     * On Android there is no point of showing application inner errors
     * */
    if (!this._platform.is('cordova')) {

      console.log(error);
      const message = (error && error.message) || 'Error occured';
      this._toastMessService.showToast({ message });

    }
    
  }

}